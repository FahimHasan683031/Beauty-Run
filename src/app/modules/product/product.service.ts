import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IProduct } from './product.interface';
import { Product } from './product.model';
import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enum/user';



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
    .search(['productName', 'description', 'id'])
    .filter()
    .sort()
    .fields()
    .paginate();

  const products = await productQueryBuilder.modelQuery;
  const meta = await productQueryBuilder.getPaginationInfo();

  return { products, meta };
};

// Get vendor products (excluding admins)
const getVendorProducts = async (query: Record<string, unknown>) => {
  const { page = 1, limit = 10, sort = '-createdAt', searchTerm, ...filterData } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const pipeline: any[] = [
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    { $unwind: '$createdBy' },
    {
      $match: { 'createdBy.role': USER_ROLES.VENDOR }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
  ];

  if (searchTerm) {
    const searchConditions: any[] = [
      { productName: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { id: searchTerm },
    ];

    if (mongoose.Types.ObjectId.isValid(searchTerm as string)) {
      searchConditions.push({ _id: new mongoose.Types.ObjectId(searchTerm as string) });
    }

    pipeline.push({ $match: { $or: searchConditions } });
  }

  if (Object.keys(filterData).length > 0) {
    pipeline.push({ $match: filterData });
  }

  const sortStr = sort as string;
  const sortOrder = sortStr.startsWith('-') ? -1 : 1;
  const sortKey = sortStr.replace(/^-/, '');
  pipeline.push({ $sort: { [sortKey]: sortOrder } });

  pipeline.push({
    $facet: {
      data: [
        { $skip: skip },
        { $limit: Number(limit) },
        {
          $project: {
            productName: 1,
            images: 1,
            price: 1,
            deliveryCharge: 1,
            offer: 1,
            description: 1,
            finalPrice: 1,
            quantity: 1,
            isActive: 1,
            totalOrder: 1,
            id: 1,
            createdAt: 1,
            updatedAt: 1,
            'category.name': 1,
            'category.image': 1,
            'category._id': 1,
            'createdBy.fullName': 1,
            'createdBy.email': 1,
            'createdBy.image': 1,
            'createdBy._id': 1,
          },
        },
      ],
      totalCount: [{ $count: 'count' }],
    },
  });

  const result = await Product.aggregate(pipeline);

  const total = result[0].totalCount[0]?.count || 0;
  const totalPage = Math.ceil(total / Number(limit));

  return {
    products: result[0].data,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage,
    },
  };
};

// Get vendor's own products
const getMyProducts = async (user: JwtPayload, query: Record<string, unknown>) => {
  if (user.role === USER_ROLES.ADMIN) {
    const { page = 1, limit = 10, sort = '-createdAt', searchTerm, ...filterData } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
        },
      },
      { $unwind: '$createdBy' },
      { $match: { 'createdBy.role': USER_ROLES.ADMIN } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
    ];

    if (searchTerm) {
      const searchConditions: any[] = [
        { productName: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { id: searchTerm },
      ];
      if (mongoose.Types.ObjectId.isValid(searchTerm as string)) {
        searchConditions.push({ _id: new mongoose.Types.ObjectId(searchTerm as string) });
      }
      pipeline.push({ $match: { $or: searchConditions } });
    }

    if (Object.keys(filterData).length > 0) {
      pipeline.push({ $match: filterData });
    }

    const sortStr = sort as string;
    const sortOrder = sortStr.startsWith('-') ? -1 : 1;
    const sortKey = sortStr.replace(/^-/, '');
    pipeline.push({ $sort: { [sortKey]: sortOrder } });

    pipeline.push({
      $facet: {
        data: [
          { $skip: skip },
          { $limit: Number(limit) },
          {
            $project: {
              productName: 1,
              images: 1,
              price: 1,
              deliveryCharge: 1,
              offer: 1,
              description: 1,
              finalPrice: 1,
              quantity: 1,
              isActive: 1,
              totalOrder: 1,
              id: 1,
              createdAt: 1,
              updatedAt: 1,
              'category.name': 1,
              'category.image': 1,
              'category._id': 1,
              'createdBy.fullName': 1,
              'createdBy.email': 1,
              'createdBy.image': 1,
              'createdBy._id': 1,
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    });

    const result = await Product.aggregate(pipeline);
    const total = result[0].totalCount[0]?.count || 0;
    const totalPage = Math.ceil(total / Number(limit));

    return {
      products: result[0].data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPage,
      },
    };
  }

  const productQueryBuilder = new QueryBuilder(
    Product.find({ createdBy: user.authId })
      .populate('category', 'name image'),
    query
  )
    .search(['productName', 'description', 'id'])
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
    .populate('createdBy', 'fullName email image role address');

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

// Get top-selling products
const getTopSellingProducts = async () => {
  const products = await Product.find({ isActive: true, quantity: { $gt: 0 } })
    .sort({ totalOrder: -1 })
    .limit(10)
    .populate('category', 'name image')
    .populate('createdBy', 'fullName email image');

  return products;
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getVendorProducts,
  getMyProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getTopSellingProducts,
};
