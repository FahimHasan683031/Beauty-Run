import mongoose from "mongoose";
import { IPayment } from "./payment.interface";
import { Payment } from "./payment.model";
import { createPaymentSession } from "../../../stripe/createPaymentSession";
import { JwtPayload } from "jsonwebtoken";
import { Order } from "../order/order.model";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { USER_ROLES } from "../../../enum/user";
import QueryBuilder from "../../builder/QueryBuilder";
import stripe from "../../../config/stripe";
import { User } from "../user/user.model";
import { logger } from "../../../shared/logger";

// Create session
const creatSession = async (user: JwtPayload, orderId: string) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  const userId = user.id || (user as any).authId;
  if (order.user.toString() !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to pay for this order");
  }

  if (order.paymentStatus === 'paid') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order is already paid');
  }

  const url = await createPaymentSession(user, order.finalPrice, orderId);

  return { url };
};

// create payment
const createPayment = async (payload: Partial<IPayment>) => {
  const payment = await Payment.create(payload);
  return payment;
};

// get payments
const getPayments = async (query: Record<string, unknown>) => {
  const paymentQueryBuilder = new QueryBuilder(Payment.find(), query)
    .filter()
    .fields()
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

// get my payments
const getMyPaymentsFromDB = async (user: JwtPayload, query: Record<string, unknown>) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const pipeline: any[] = [
    {
      $lookup: {
        from: 'orders',
        localField: 'referenceId',
        foreignField: '_id',
        as: 'order',
      },
    },
    { $unwind: '$order' },
    {
      $lookup: {
        from: 'products',
        localField: 'order.product',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
  ];

  // Role-based matching
  if (user.role === USER_ROLES.CUSTOMER) {
    pipeline.push({ $match: { 'order.user': new mongoose.Types.ObjectId(user.authId) } });
  } else if (user.role === USER_ROLES.VENDOR) {
    pipeline.push({ $match: { 'product.createdBy': new mongoose.Types.ObjectId(user.authId) } });
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
            amount: 1,
            transactionId: 1,
            chargeId: 1,
            dateTime: 1,
            customerName: 1,
            email: 1,
            productPrice: 1,
            discount: 1,
            finalPrice: 1,
            customerPaymentAmount: 1,
            stripeGatewayFee: 1,
            platformCommission: 1,
            vendorPayoutAmount: 1,
            refundAmount: 1,
            status: 1,
            'order._id': 1,
            'order.status': 1,
            'product.productName': 1,
          },
        },
      ],
      totalCount: [{ $count: 'count' }],
    },
  });

  const result = await Payment.aggregate(pipeline);

  const total = result[0].totalCount[0]?.count || 0;
  const totalPage = Math.ceil(total / Number(limit));

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage,
    },
    data: result[0].data,
  };
};

/**
 * Process payout to vendor connected account
 */
const processPayout = async (orderId: string) => {
  logger.info(`[Payout] Starting process for Order: ${orderId}`);
  try {
    const payment = await Payment.findOne({ referenceId: orderId });
    if (!payment) {
      logger.error(`[Payout] ❌ Payment record not found for Order: ${orderId}`);
      return;
    }

    logger.info(`[Payout] Payment record found. Status: ${payment.status}, Payout Amount: ${payment.vendorPayoutAmount}`);

    if (payment.status !== 'customer_paid') {
      logger.warn(`[Payout] ⚠️ Payment for Order ${orderId} is not in 'customer_paid' status. Current status: ${payment.status}`);
      return;
    }

    const order = await Order.findById(orderId).populate('product');
    if (!order) {
      logger.error(`[Payout] ❌ Order not found: ${orderId}`);
      return;
    }

    if (!order.product) {
      logger.error(`[Payout] ❌ Product not found for Order: ${orderId}`);
      return;
    }

    const vendorId = (order.product as any).createdBy;
    const vendor = await User.findById(vendorId);

    if (!vendor) {
      logger.error(`[Payout] ❌ Vendor not found (ID: ${vendorId})`);
      return;
    }

    if (!vendor.stripeConnect?.accountId || !vendor.stripeConnect.onboardingCompleted) {
      logger.error(`[Payout] ❌ Vendor ${vendorId} has not completed Stripe onboarding or account ID is missing.`);
      return;
    }

    logger.info(`[Payout] Processing transfer to Stripe Account: ${vendor.stripeConnect.accountId}`);

    const transferData: any = {
      amount: Math.round(payment.vendorPayoutAmount * 100),
      currency: 'usd',
      destination: vendor.stripeConnect.accountId,
      metadata: { orderId: orderId.toString(), transactionId: payment.transactionId }
    };

    // If we have a source_transaction (Charge ID), use it to link the transfer
    // This allows the transfer to be funded by the original charge even if balance is pending
    if (payment.chargeId) {
      logger.info(`[Payout] Using source_transaction: ${payment.chargeId}`);
      transferData.source_transaction = payment.chargeId;
    }

    const transfer = await stripe.transfers.create(transferData);

    await Payment.findByIdAndUpdate(payment._id, {
      status: 'settled',
    });

    logger.info(`[Payout] ✅ SUCCESS: Payout of ${payment.vendorPayoutAmount} processed for Vendor: ${vendor.stripeConnect.accountId} (Order: ${orderId}, Transfer: ${transfer.id})`);
  } catch (error) {
    logger.error(`[Payout] ❌ FATAL ERROR for Order ${orderId}:`, error);
  }
};

/**
 * Process refund to customer
 */
const processRefund = async (orderId: string) => {
  logger.info(`[Refund] Starting process for Order: ${orderId}`);
  try {
    const payment = await Payment.findOne({ referenceId: orderId });
    if (!payment) {
      logger.error(`[Refund] ❌ Payment record not found for Order: ${orderId}`);
      return;
    }

    if (payment.status === 'refunded') {
      logger.warn(`[Refund] ⚠️ Payment for Order ${orderId} is already refunded.`);
      return;
    }

    const refund = await stripe.refunds.create({
      payment_intent: payment.transactionId,
    });

    await Payment.findByIdAndUpdate(payment._id, {
      status: 'refunded',
      refundAmount: payment.finalPrice, // Full refund
    });

    logger.info(`[Refund] ✅ SUCCESS: Refund processed for Order: ${orderId} (Refund: ${refund.id})`);
  } catch (error) {
    logger.error(`[Refund] ❌ FATAL ERROR for Order ${orderId}:`, error);
  }
};

export const PaymentService = {
  creatSession,
  createPayment,
  getPayments,
  getPaymentById,
  getMyPaymentsFromDB,
  processPayout,
  processRefund
};
