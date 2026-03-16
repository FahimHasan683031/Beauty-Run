import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { WishlistService } from './wishlist.service';

const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await WishlistService.addToWishlist(req.user!, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Added to wishlist successfully',
    data: result,
  });
});

const getMyWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await WishlistService.getMyWishlist(req.user!, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Wishlist retrieved successfully',
    data: result.result,
    meta: result.meta,
  });
});

const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await WishlistService.removeFromWishlist(req.user!, req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Removed from wishlist successfully',
    data: result,
  });
});

export const WishlistController = {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
};
