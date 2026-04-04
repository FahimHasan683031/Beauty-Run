import mongoose, { Schema } from 'mongoose';
import { IProduct } from './product.interface';
import { generateFormattedId } from '../../../util/generateId';

const productSchema = new Schema<IProduct>(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    id: {
      type: String,
      unique: true,
    },
    images: {
      type: [String],
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    offer: {
      type: Number,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre('save', async function (next) {
  if (!this.id) {
    this.id = await generateFormattedId('Product', 'PRD');
  }
  next();
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
