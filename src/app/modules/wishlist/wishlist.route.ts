import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { WishlistController } from './wishlist.controller';
import { WishlistValidations } from './wishlist.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.CUSTOMER, USER_ROLES.VENDOR),
  validateRequest(WishlistValidations.createWishlistZod),
  WishlistController.addToWishlist
);

router.get(
  '/',
  auth(USER_ROLES.CUSTOMER, USER_ROLES.VENDOR),
  WishlistController.getMyWishlist
);

router.delete(
  '/:id',
  auth(USER_ROLES.CUSTOMER, USER_ROLES.VENDOR),
  WishlistController.removeFromWishlist
);

export const WishlistRoutes = router;
