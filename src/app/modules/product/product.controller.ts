import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ProductService } from './product.service';

// Create product
const createProduct = catchAsync(async (req: Request, res: Response) => {
  const images = req.body.images || [];
  const result = await ProductService.createProduct(req.user!, req.body, images);
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

// Get my products (vendor)
const getMyProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getMyProducts(req.user!, req.query);
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
  const result = await ProductService.updateProduct(req.user!, req.params.id, req.body, images);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product updated successfully',
    data: result,
  });
});

// Delete product
const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.deleteProduct(req.user!, req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product deleted successfully',
    data: result,
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  getMyProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
