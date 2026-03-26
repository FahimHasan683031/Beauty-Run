import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import { DashboardController } from './dashboard.controller';

const router = express.Router();

router.get(
  '/vendor-stats',
  auth(USER_ROLES.VENDOR),
  DashboardController.getVendorStats
);

router.get(
  '/admin-stats',
  auth(USER_ROLES.ADMIN),
  DashboardController.getAdminStats
);

export const DashboardRoutes = router;
