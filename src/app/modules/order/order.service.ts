import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { Product } from '../product/product.model';
import { IOrder } from './order.interface';
import { Order } from './order.model';
import { PaymentService } from '../payment/payment.service'
import QueryBuilder from '../../builder/QueryBuilder';
import { createPaymentSession } from '../../../stripe/createPaymentSession';
import { USER_ROLES } from '../../../enum/user';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/user.model';

// create order
const createOrderToDB = async (user: JwtPayload, payload: Partial<IOrder>) => {
  const product = await Product.findById(payload.product);
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  const orderedQty = payload.quantity || 1;
  if (product.quantity < orderedQty) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Insufficient stock. Only ${product.quantity} item(s) available.`);
  }

  const orderPrice = product.price * orderedQty;
  const deliveryCharge = product.deliveryCharge || 0;
  const discount = (product.price - product.finalPrice) * orderedQty;
  const orderFinalPrice = (product.finalPrice * orderedQty) + deliveryCharge;

  const orderData = {
    ...payload,
    user: user.id || user.authId,
    price: orderPrice,
    deliveryCharge,
    discount,
    finalPrice: orderFinalPrice,
  };

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const result = await Order.create([orderData], { session });
    if (!result.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create order');
    }

    await Product.findByIdAndUpdate(
      payload.product,
      { $inc: { quantity: -orderedQty } },
      { session }
    );

    const vendorUser = await User.findById(product.createdBy).session(session);
    if (vendorUser) {
      await NotificationService.insertNotification({
        title: "New Order Received!",
        message: `You have received a new order for ${product.productName}.`,
        receiver: vendorUser._id,
        type: vendorUser.role === USER_ROLES.ADMIN ? "ADMIN" : "USER",
        referenceId: result[0]._id
      }, session);
    }

    await session.commitTransaction();

    const paymentUrl = await createPaymentSession(user, orderFinalPrice, result[0]._id.toString());
    return { result: result[0], paymentUrl };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// get all orders
const getAllOrdersFromDB = async (query: Record<string, unknown>) => {
  const orderQueryBuilder = new QueryBuilder(
    Order.find().populate('user', 'fullName email').populate('product', 'productName image'),
    query
  )
    .filter()
    .search([ 'number',"id",'user','transactionId'])
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
  } else if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.ADMIN) {
    pipeline.push({ $match: { 'product.createdBy': new mongoose.Types.ObjectId(user.authId) } });
  }

  // Handle searchTerm
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { 'product.productName': { $regex: searchTerm, $options: 'i' } },
          { 'address': { $regex: searchTerm, $options: 'i' } },
          {id: { $regex: searchTerm, $options: 'i' } },
          {number: { $regex: searchTerm, $options: 'i' } },
          {transactionId: { $regex: searchTerm, $options: 'i' } },
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
            deliveryCharge: 1,
            discount: 1,
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
    if (currentStatus === 'pending' && newStatus === 'processing') {
       throw new ApiError(StatusCodes.BAD_REQUEST, "Wait for payment confirmation before processing");
    }
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const result = await Order.findByIdAndUpdate(id, payload, { new: true, session });
    const productObj = order.product as any;

    if (newStatus === 'processing' || newStatus === 'shipped') {
      await NotificationService.insertNotification({
        title: "Order Status Updated",
        message: `Your order for ${productObj.productName} is now ${newStatus}.`,
        receiver: order.user,
        type: "USER",
        referenceId: order._id
      }, session);
    }

    if (newStatus === 'delivered' && currentStatus !== 'delivered') {
      await NotificationService.insertNotification({
        title: "Order Delivered!",
        message: `Your order for ${productObj.productName} has been delivered. Enjoy!`,
        receiver: order.user,
        type: "USER",
        referenceId: order._id
      }, session);

      await PaymentService.processPayout(id, session);
    } else if (newStatus === 'cancelled' && currentStatus !== 'cancelled') {
      await PaymentService.processRefund(id, session);
      
      await Product.findByIdAndUpdate(order.product, {
        $inc: { quantity: order.quantity || 1 }
      }, { session });

      await NotificationService.insertNotification({
        title: "Order Cancelled",
        message: `Your order for ${productObj.productName} has been cancelled.`,
        receiver: order.user,
        type: "USER",
        referenceId: order._id
      }, session);

      const vendorUser = await User.findById(productObj.createdBy).session(session);
      if (vendorUser) {
        await NotificationService.insertNotification({
          title: "Order Cancelled",
          message: `The order for ${productObj.productName} was cancelled.`,
          receiver: vendorUser._id,
          type: vendorUser.role === USER_ROLES.ADMIN ? "ADMIN" : "USER",
          referenceId: order._id
        }, session);
      }
    }

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const OrderService = {
  createOrderToDB,
  getAllOrdersFromDB,
  getMyOrdersFromDB,
  getSingleOrderFromDB,
  updateOrderToDB,
};
