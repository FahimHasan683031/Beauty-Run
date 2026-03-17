import { Router } from 'express';
import { SettingsController } from './settings.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';

const router = Router();

router.get(
  '/',
  auth(USER_ROLES.ADMIN),
  SettingsController.getSettings
);

router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  SettingsController.updateSettings
);

export const SettingsRoutes = router;
