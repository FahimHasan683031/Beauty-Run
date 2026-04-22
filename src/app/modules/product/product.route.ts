import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';
import validateRequest from '../../middleware/validateRequest';
import { ProductController } from './product.controller';
import { ProductValidations } from './product.validation';

const router = express.Router();

// Create product — Vendor only
router.post(
  '/',
  auth(USER_ROLES.VENDOR, USER_ROLES.ADMIN),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(ProductValidations.createProductZod),
  ProductController.createProduct
);

// Get all products — Public
router.get('/', auth(USER_ROLES.VENDOR, USER_ROLES.ADMIN, USER_ROLES.CUSTOMER), ProductController.getAllProducts);

// Get vendor products — Public (excludes admins)
router.get(
  '/vendor-products',
  auth(USER_ROLES.VENDOR, USER_ROLES.ADMIN, USER_ROLES.CUSTOMER),
  ProductController.getVendorProducts
);

// Get my products — Vendor only
router.get(
  '/my-products',
  auth(USER_ROLES.VENDOR, USER_ROLES.ADMIN),
  ProductController.getMyProducts
);

// Get top-selling products — Public
router.get(
  '/top-selling',
  auth(USER_ROLES.VENDOR, USER_ROLES.ADMIN, USER_ROLES.CUSTOMER),
  ProductController.getTopSellingProducts
);
 
// Get single product — Public
router.get('/:id',auth(USER_ROLES.VENDOR, USER_ROLES.ADMIN, USER_ROLES.CUSTOMER), ProductController.getSingleProduct);

// Update product — Vendor or Admin
router.patch(
  '/:id',
  auth(USER_ROLES.VENDOR, USER_ROLES.ADMIN),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(ProductValidations.updateProductZod),
  ProductController.updateProduct
);

// Delete product — Vendor or Admin
router.delete(
  '/:id',
  auth(USER_ROLES.VENDOR, USER_ROLES.ADMIN),
  ProductController.deleteProduct
);

export const ProductRoutes = router;
