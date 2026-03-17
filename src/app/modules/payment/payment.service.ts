import QueryBuilder from "../../builder/QueryBuilder";
import { IPayment } from "./payment.interface";
import { Payment } from "./payment.model";
import { createPaymentSession } from "../../../stripe/createPaymentSession";
import config from "../../../config";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
import stripe from "../../../config/stripe";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

import { Order } from "../order/order.model";
import { Settings } from "../settings/settings.model";

// Create seassion
const creatSession = async (userPayload: JwtPayload, referenceId: string, amount: number) => {
  // Find the order to determine vendor
  const order = await Order.findById(referenceId).populate({
    path: 'product',
    populate: { path: 'createdBy' } // Populate the vendor user
  });

  if (!order || !order.product) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order or Product not found");
  }

  const product: any = order.product;
  const vendor = product.createdBy;

  if (!vendor || !vendor.stripeAccountId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Vendor has not connected a Stripe account");
  }

  // Get platform commission rate
  let settings = await Settings.findOne();
  const commissionRate = settings ? settings.commissionRate : 0;
  
  // Calculate amounts
  const platformFee = (amount * commissionRate) / 100;

  const url = await createPaymentSession(
    userPayload,
    amount,
    referenceId,
    platformFee,
    vendor.stripeAccountId
  );

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

// Start or continue vendor Stripe onboarding
const onboardVendor = async (userPayload: JwtPayload) => {
  const user = await User.findById(userPayload.id || userPayload.authId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user.role !== 'vendor') {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only vendors can onboard to Stripe");
  }

  let accountId = user.stripeAccountId;

  // Create Stripe account if it doesn't exist
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      individual: {
        email: user.email,
        first_name: user.fullName // Depending on how you store names, it might need splitting
      }
    });
    accountId = account.id;
    user.stripeAccountId = accountId;
    await user.save();
  }

  // Generate an account link for them to complete the form
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${config.stripe.frontendUrl}/payment/onboard-refresh`, // Adjust as needed
    return_url: `${config.stripe.frontendUrl}/payment/onboard-success`,
    type: 'account_onboarding',
  });

  return { url: accountLink.url };
};

// Check vendor Stripe onboarding status
const checkOnboardingStatus = async (userPayload: JwtPayload) => {
  const user = await User.findById(userPayload.id || userPayload.authId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (!user.stripeAccountId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Stripe account not initiated yet");
  }

  // Retrieve account details from Stripe
  const account = await stripe.accounts.retrieve(user.stripeAccountId);

  // Sync our local DB with Stripe's status
  user.stripeAccountStatus = {
    detailsSubmitted: account.details_submitted,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
  };

  await user.save();

  return {
    stripeAccountStatus: user.stripeAccountStatus,
    isFullyOnboarded: account.charges_enabled && account.payouts_enabled
  };
};

export const PaymentService = {
  creatSession,
  createPayment,
  getPayments,
  getPaymentById,
  onboardVendor,
  checkOnboardingStatus,
}
