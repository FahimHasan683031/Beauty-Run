import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { Product } from '../product/product.model';
import { IWishlist } from './wishlist.interface';
import { Wishlist } from './wishlist.model';
import QueryBuilder from '../../builder/QueryBuilder';

// Add to wishlist
const addToWishlist = async (user: JwtPayload, payload: Partial<IWishlist>) => {
  const product = await Product.findById(payload.product);
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  const existingWishlist = await Wishlist.findOne({
    user: user.id || user.authId,
    product: payload.product,
  });

  if (existingWishlist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Product already in wishlist');
  }

  const wishlistData = {
    user: user.id || user.authId,
    product: payload.product,
  };

  const result = await Wishlist.create(wishlistData);
  return result;
};

// Get my wishlist
const getMyWishlist = async (user: JwtPayload, query: Record<string, unknown>) => {
  const wishlistQueryBuilder = new QueryBuilder(
    Wishlist.find({ user: user.id || user.authId }).populate('product'),
    query
  )
    .filter()
    .sort()
    .paginate();

  const result = await wishlistQueryBuilder.modelQuery;
  const meta = await wishlistQueryBuilder.getPaginationInfo();

  return { meta, result };
};

// Remove from wishlist
const removeFromWishlist = async (user: JwtPayload, id: string) => {
  const wishlistItem = await Wishlist.findById(id);
  if (!wishlistItem) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Wishlist item not found');
  }

  const userId = user.id || user.authId;
  if (wishlistItem.user.toString() !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to remove this item');
  }

  await Wishlist.findByIdAndDelete(id);
  return { message: 'Removed from wishlist successfully' };
};

export const WishlistService = {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
};
