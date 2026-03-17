import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { Product } from '../product/product.model';
import { IOrder } from './order.interface';
import { Order } from './order.model';
import QueryBuilder from '../../builder/QueryBuilder';

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
  const result = await Order.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

export const OrderService = {
  createOrderToDB,
  getAllOrdersFromDB,
  getMyOrdersFromDB,
  getSingleOrderFromDB,
  updateOrderToDB,
};
