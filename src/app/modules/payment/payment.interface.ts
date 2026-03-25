import { Types } from 'mongoose';

export type IPayment = {
  _id: Types.ObjectId;
  email: string;
  dateTime: Date;
  referenceId?: Types.ObjectId;
  amount: number;
  transactionId: string;
  description?: string;
  customerName?: string;
  productPrice: number;
  discount: number;
  finalPrice: number;
  customerPaymentAmount: number;
  stripeGatewayFee: number;
  platformCommission: number;
  vendorPayoutAmount: number;
  refundAmount: number;
  chargeId?: string;
  status: 'customer_paid' | 'settled' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
};
