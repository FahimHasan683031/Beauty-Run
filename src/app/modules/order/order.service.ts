import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { Product } from '../product/product.model';
import { IOrder } from './order.interface';
import { Order } from './order.model';
import config from '../../../config'
import { createConnectAccount, createOnboardingUrl, getAccountStatus } from '../../../stripe/stripeConnect'
import { PaymentService } from '../payment/payment.service'
import { logger } from '../../../shared/logger';
import QueryBuilder from '../../builder/QueryBuilder';
import { createPaymentSession } from '../../../stripe/createPaymentSession';
import { USER_ROLES } from '../../../enum/user';

// create order
const createOrderToDB = async (user: JwtPayload, payload: Partial<IOrder>) => {
  const product = await Product.findById(payload.product);
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  // Check stock
  const orderedQty = payload.quantity || 1;
  if (product.quantity < orderedQty) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Insufficient stock. Only ${product.quantity} item(s) available.`);
  }

  // Record current price and finalPrice from product snapshot
  const orderPrice = product.price;
  const orderFinalPrice = product.finalPrice;

  const orderData = {
    ...payload,
    user: user.id || user.authId,
    price: orderPrice,
    finalPrice: orderFinalPrice,
  };

  const result = await Order.create(orderData);

  // Decrement stock atomically
  await Product.findByIdAndUpdate(payload.product, {
    $inc: { quantity: -orderedQty }
  });

  const paymentUrl = await createPaymentSession(user, orderFinalPrice, result._id.toString());

  return { result, paymentUrl };
};

// get all orders
const getAllOrdersFromDB = async (query: Record<string, unknown>) => {
  const orderQueryBuilder = new QueryBuilder(
    Order.find().populate('user', 'fullName email').populate('product', 'productName image'),
    query
  )
    .filter()
    .sort()
    .paginate();

  const result = await orderQueryBuilder.modelQuery;
  const meta = await orderQueryBuilder.getPaginationInfo();

  return { meta, result };
};

// get my orders
const getMyOrdersFromDB = async (user: JwtPayload, query: Record<string, unknown>) => {
  const { page = 1, limit = 10, sort = '-createdAt', searchTerm, ...filterData } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const pipeline: any[] = [
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
  ];

  // Role-based matching
  if (user.role === USER_ROLES.CUSTOMER) {
    pipeline.push({ $match: { user: new mongoose.Types.ObjectId(user.authId) } });
  } else if (user.role === USER_ROLES.VENDOR) {
    pipeline.push({ $match: { 'product.createdBy': new mongoose.Types.ObjectId(user.authId) } });
  }

  // Handle searchTerm
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { 'product.productName': { $regex: searchTerm, $options: 'i' } },
          { 'address': { $regex: searchTerm, $options: 'i' } },
        ],
      },
    });
  }

  // Filtering (basic match)
  if (Object.keys(filterData).length > 0) {
    pipeline.push({ $match: filterData });
  }

  // Sorting
  const sortStr = sort as string;
  const sortOrder = sortStr.startsWith('-') ? -1 : 1;
  const sortKey = sortStr.replace(/^-/, '');
  pipeline.push({ $sort: { [sortKey]: sortOrder } });

  // Facet for results and count
  pipeline.push({
    $facet: {
      data: [
        { $skip: skip },
        { $limit: Number(limit) },
        {
          $project: {
            _id: 1,
            user: 1,
            quantity: 1,
            price: 1,
            finalPrice: 1,
            status: 1,
            paymentStatus: 1,
            transactionId: 1,
            address: 1,
            number: 1,
            instruction: 1,
            createdAt: 1,
            'product.productName': 1,
            'product.images': 1,
            'product._id': 1,
          },
        },
      ],
      totalCount: [{ $count: 'count' }],
    },
  });

  const result = await Order.aggregate(pipeline);

  const total = result[0].totalCount[0]?.count || 0;
  const totalPage = Math.ceil(total / Number(limit));

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage,
    },
    result: result[0].data,
  };
};

// get single order
const getSingleOrderFromDB = async (id: string) => {
  const result = await Order.findById(id)
    .populate('user', 'fullName email')
    .populate('product', 'productName images');
  return result;
};

// update order
const updateOrderToDB = async (id: string, user: JwtPayload, payload: Partial<IOrder>) => {
  const order = await Order.findById(id).populate('product');
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  const currentStatus = order.status;
  const newStatus = payload.status;
  const userId = user.id || user.authId;

  // Validation based on roles
  if (user.role === USER_ROLES.CUSTOMER) {
    if (order.user.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, "You cannot update someone else's order");
    }
    if (newStatus && newStatus !== 'cancelled') {
      throw new ApiError(StatusCodes.FORBIDDEN, "Customers can only cancel orders");
    }
    if (newStatus === 'cancelled' && ['shipped', 'delivered', 'cancelled'].includes(currentStatus)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Cannot cancel order when it is already ${currentStatus}`);
    }
  } 
  else if (user.role === USER_ROLES.VENDOR) {
    const product = order.product as any;
    if (product.createdBy.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, "This order is not for one of your products");
    }
    const allowedVendorStatuses = ['processing', 'shipped'];
    if (newStatus && !allowedVendorStatuses.includes(newStatus)) {
      throw new ApiError(StatusCodes.FORBIDDEN, `Vendors can only update status to: ${allowedVendorStatuses.join(', ')}`);
    }
    // Business logic: cannot go backwards or skip confirmed
    if (currentStatus === 'pending' && newStatus === 'processing') {
       throw new ApiError(StatusCodes.BAD_REQUEST, "Wait for payment confirmation before processing");
    }
  }
  // Admin (and others) have full control in this logic branch

  const result = await Order.findByIdAndUpdate(id, payload, { new: true });

  if (newStatus === 'delivered' && currentStatus !== 'delivered') {
    // Platform to Vendor payout
    logger.info(`Order ${id} marked as delivered. Triggering payout...`);
    await PaymentService.processPayout(id);
  } else if (newStatus === 'cancelled' && currentStatus !== 'cancelled') {
    // Platform to Customer refund
    logger.info(`Order ${id} marked as cancelled. Triggering refund...`);
    await PaymentService.processRefund(id);
    // Restore product stock
    await Product.findByIdAndUpdate(order.product, {
      $inc: { quantity: order.quantity || 1 }
    });
    logger.info(`Stock restored for product: ${order.product}`);
  }

  return result;
};

export const OrderService = {
  createOrderToDB,
  getAllOrdersFromDB,
  getMyOrdersFromDB,
  getSingleOrderFromDB,
  updateOrderToDB,
};
