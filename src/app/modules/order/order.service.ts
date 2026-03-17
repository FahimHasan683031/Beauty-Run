import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { Product } from '../product/product.model';
import { IOrder } from './order.interface';
import { Order } from './order.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { NotificationService } from '../notification/notification.service';

const createOrderToDB = async (user: JwtPayload, payload: Partial<IOrder>) => {
  const product = await Product.findById(payload.product);
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
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

  // Send Notification to Vendor
  if (product.createdBy) {
    await NotificationService.insertNotification({
      receiver: product.createdBy,
      title: 'New Order Received!',
      message: `You have received a new order for ${product.productName}.`,
      type: 'USER',
      referenceId: result._id,
      screen: 'ORDER_DETAILS'
    });
  }

  return result;
};

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

const getMyOrdersFromDB = async (user: JwtPayload, query: Record<string, unknown>) => {
  const orderQueryBuilder = new QueryBuilder(
    Order.find({ user: user.id || user.authId }).populate('product', 'productName image'),
    query
  )
    .filter()
    .sort()
    .paginate();

  const result = await orderQueryBuilder.modelQuery;
  const meta = await orderQueryBuilder.getPaginationInfo();

  return { meta, result };
};

const getSingleOrderFromDB = async (id: string) => {
  const result = await Order.findById(id)
    .populate('user', 'fullName email')
    .populate('product', 'productName image');
  return result;
};

const updateOrderToDB = async (id: string, payload: Partial<IOrder>) => {
  const existingOrder = await Order.findById(id);
  if (!existingOrder) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  const result = await Order.findByIdAndUpdate(id, payload, { new: true });

  // If status has changed, notify the customer
  if (payload.status && payload.status !== existingOrder.status) {
    await NotificationService.insertNotification({
      receiver: existingOrder.user,
      title: 'Order Status Updated',
      message: `Your order status is now ${payload.status}.`,
      type: 'USER',
      referenceId: existingOrder._id,
      screen: 'ORDER_DETAILS'
    });
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
