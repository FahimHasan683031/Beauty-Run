import QueryBuilder from "../../builder/QueryBuilder";
import { IPayment } from "./payment.interface";
import { Payment } from "./payment.model";
import { createPaymentSession } from "../../../stripe/createPaymentSession";
import config from "../../../config";
import { JwtPayload } from "jsonwebtoken";
import { Order } from "../order/order.model";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

// Create seassion
const creatSession = async (user: JwtPayload, orderId: string) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  if (order.user.toString() !== (user.id || (user as any).authId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to pay for this order");
  }

  if (order.paymentStatus === 'paid') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order is already paid');
  }

  const url = await createPaymentSession(user, order.finalPrice, orderId);

  return { url }
}

// create payment
const createPayment = async (payload: Partial<IPayment>) => {
  const payment = await Payment.create(payload);
  return payment;
};

// get payments
const getPayments = async (query: Record<string, unknown>) => {
  const paymentQueryBuilder = new QueryBuilder(Payment.find(), query)
    .filter()
    .sort()
    .paginate();

  const payments = await paymentQueryBuilder.modelQuery;
  const paginationInfo = await paymentQueryBuilder.getPaginationInfo();

  return {
    data: payments,
    meta: paginationInfo,
  };
};

// get payment by id
const getPaymentById = async (id: string) => {
  return await Payment.findById(id).populate('referenceId');
};

export const PaymentService = {
  creatSession,
  createPayment,
  getPayments,
  getPaymentById,
}
