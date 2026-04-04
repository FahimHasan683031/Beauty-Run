import { Types } from 'mongoose';

export interface IProduct {
  _id?: Types.ObjectId;
  id: string;
  productName: string;
  images: string[];
  category: Types.ObjectId;
  price: number;
  deliveryCharge: number;
  offer?: number;
  description: string;
  createdBy: Types.ObjectId;
  isActive: boolean;
  finalPrice: number;
  quantity: number;
  totalOrder: number;
}
