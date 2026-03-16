import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { SupportController } from './support.controller';
import { SupportValidations } from './support.validation';
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.CUSTOMER, USER_ROLES.VENDOR),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(SupportValidations.createSupportZod),
  SupportController.createSupport
);

router.get(
  '/',
  auth(USER_ROLES.ADMIN),
  SupportController.getAllSupportTickets
);

router.get(
  '/my-tickets',
  auth(USER_ROLES.CUSTOMER, USER_ROLES.VENDOR),
  SupportController.getMySupportTickets
);

router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.CUSTOMER, USER_ROLES.VENDOR),
  SupportController.getSingleSupportTicket
);

router.patch(
  '/:id/status',
  auth(USER_ROLES.ADMIN),
  validateRequest(SupportValidations.updateSupportStatusZod),
  SupportController.updateSupportStatus
);

export const SupportRoutes = router;
