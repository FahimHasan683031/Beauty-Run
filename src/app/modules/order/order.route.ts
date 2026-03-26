import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { OrderController } from './order.controller';
import { OrderValidations } from './order.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.CUSTOMER),
  validateRequest(OrderValidations.createOrderZod),
  OrderController.createOrder
);

router.get(
  '/',
  auth(USER_ROLES.ADMIN),
  OrderController.getAllOrders
);

router.get(
  '/my-orders',
  auth(USER_ROLES.CUSTOMER, USER_ROLES.VENDOR, USER_ROLES.ADMIN),
  OrderController.getMyOrders
);

router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.CUSTOMER),
  OrderController.getSingleOrder
);

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.CUSTOMER),
  validateRequest(OrderValidations.updateOrderZod),
  OrderController.updateOrder
);

export const OrderRoutes = router;
