import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ProductService } from './product.service';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enum/user';
import ApiError from '../../../errors/ApiError';
import { UserServices } from '../user/user.service';

// Create product
const createProduct = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user!.authId);
  if (user?.role === USER_ROLES.VENDOR) {
    if (!user.stripeConnect?.onboardingCompleted) {
      // Try to sync status in case they just completed it
      try {
        const syncedUser = await UserServices.syncStripeStatus((req as any).user!);
        if (!syncedUser?.stripeConnect?.onboardingCompleted) {
          const onboardingUrl = await UserServices.getOnboardingUrl((req as any).user!);
          throw new ApiError(StatusCodes.FORBIDDEN, "Please complete your Stripe onboarding to create products.", { onboardingUrl });
        }
      } catch (error: any) {
        if (error instanceof ApiError) throw error;
        const onboardingUrl = await UserServices.getOnboardingUrl((req as any).user!);
        throw new ApiError(StatusCodes.FORBIDDEN, "Please complete your Stripe onboarding to create products.", { onboardingUrl });
      }
    }
  }

  const images = req.body.images || [];
  const result = await ProductService.createProduct((req as any).user!, req.body, images);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Product created successfully',
    data: result,
  });
});

// Get all products (public)
const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllProducts(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Products retrieved successfully',
    data: result.products,
    meta: result.meta,
  });
});

// Get vendor products (excluding admins)
const getVendorProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getVendorProducts(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Vendor products retrieved successfully',
    data: result.products,
    meta: result.meta,
  });
});

// Get my products (vendor)
const getMyProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getMyProducts((req as any).user!, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Products retrieved successfully',
    data: result.products,
    meta: result.meta,
  });
});

// Get single product
const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getSingleProduct(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product retrieved successfully',
    data: result,
  });
});

// Update product
const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const images = req.body.images || [];
  const result = await ProductService.updateProduct((req as any).user!, req.params.id, req.body, images);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product updated successfully',
    data: result,
  });
});

// Delete product
const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.deleteProduct((req as any).user!, req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product deleted successfully',
    data: result,
  });
});
 
// Get top-selling products
const getTopSellingProducts = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductService.getTopSellingProducts();
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Top-selling products retrieved successfully',
        data: result,
    });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  getVendorProducts,
  getMyProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getTopSellingProducts,
};
