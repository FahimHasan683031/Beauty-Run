import { Types } from 'mongoose';

export interface IOrder {
  _id?: Types.ObjectId;
  id: string;
  user: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  price: number;
  deliveryCharge: number;
  discount: number;
  finalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  transactionId?: string;
  address: string;
  number: string;
  instruction?: string;
  cancelReason?: string;
  label?: "Home" | "Office" | "Relative"| "Other";
}
