import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IProduct } from './product.interface';
import { Product } from './product.model';
import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';


// Create product
const createProduct = async (user: JwtPayload, payload: IProduct, images: string[]) => {
  if (!images || images.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'At least one product image is required');
  }

  const finalPrice = payload.offer
    ? payload.price - (payload.price * payload.offer) / 100
    : payload.price;

  const product = await Product.create({
    ...payload,
    images: images,
    createdBy: user.authId,
    finalPrice: Math.round(finalPrice * 100) / 100,
  });

  return product;
};

// Get all products
const getAllProducts = async (query: Record<string, unknown>) => {
  const productQueryBuilder = new QueryBuilder(
    Product.find({ isActive: true })
      .populate('category', 'name image')
      .populate('createdBy', 'fullName email image'),
    query
  )
    .search(['productName', 'description'])
    .filter()
    .sort()
    .fields()
    .paginate();

  const products = await productQueryBuilder.modelQuery;
  const meta = await productQueryBuilder.getPaginationInfo();

  return { products, meta };
};

// Get vendor's own products
const getMyProducts = async (user: JwtPayload, query: Record<string, unknown>) => {
  const productQueryBuilder = new QueryBuilder(
    Product.find({ createdBy: user.authId })
      .populate('category', 'name image'),
    query
  )
    .search(['productName', 'description'])
    .filter()
    .sort()
    .paginate();

  const products = await productQueryBuilder.modelQuery;
  const meta = await productQueryBuilder.getPaginationInfo();

  return { products, meta };
};

// Get single product
const getSingleProduct = async (id: string) => {
  const product = await Product.findById(id)
    .populate('category', 'name image')
    .populate('createdBy', 'fullName email image');

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  return product;
};

// Update product
const updateProduct = async (
  user: JwtPayload,
  id: string,
  payload: Partial<IProduct>,
  images?: string[]
) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  if (product.createdBy.toString() !== user.authId && user.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to update this product');
  }

  const updateData: Partial<IProduct> = { ...payload };
  if (images && images.length > 0) {
    updateData.images = images;
  }

  // Recalculate finalPrice if price or offer changes
  const newPrice = updateData.price ?? product.price;
  const newOffer = updateData.offer !== undefined ? updateData.offer : product.offer;
  const finalPrice = newOffer
    ? newPrice - (newPrice * newOffer) / 100
    : newPrice;
  updateData.finalPrice = Math.round(finalPrice * 100) / 100;

  const updated = await Product.findByIdAndUpdate(id, updateData, { new: true })
    .populate('category', 'name image')
    .populate('createdBy', 'fullName email image');

  return updated;
};

// Delete product
const deleteProduct = async (user: JwtPayload, id: string) => {
  
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  if (product.createdBy.toString() !== user.authId && user.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this product');
  }

  await Product.findByIdAndDelete(id);
  return { message: 'Product deleted successfully' };
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getMyProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
