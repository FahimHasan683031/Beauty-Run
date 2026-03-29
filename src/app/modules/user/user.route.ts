import express from 'express'
import { UserController } from './user.controller'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody'
import validateRequest from '../../middleware/validateRequest'
import { UserValidations } from './user.validation'

const router = express.Router()

router.get(
  '/me',
  auth(USER_ROLES.VENDOR, USER_ROLES.CUSTOMER, USER_ROLES.ADMIN),
  UserController.getProfile,
)
router.get('/', auth(USER_ROLES.ADMIN), UserController.getAllUser);


router.get(
  '/onboarding-url',
  auth(USER_ROLES.VENDOR),
  UserController.getOnboardingUrl
)

router.get(
  '/sync-stripe',
  auth(USER_ROLES.VENDOR),
  UserController.syncStripeStatus
)

// get single user
router.get('/:id', UserController.getSingleUser)

router.patch(
  '/profile',
  auth(USER_ROLES.VENDOR, USER_ROLES.CUSTOMER, USER_ROLES.ADMIN),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(UserValidations.userUpdateSchema),
  UserController.updateProfile,
)

router.patch(
  '/block-unblock/:id',
  auth(USER_ROLES.ADMIN),
  UserController.blocOrUnblockUser,
)

// delete my account
router.delete(
  '/me',
  auth(USER_ROLES.VENDOR, USER_ROLES.CUSTOMER),
  UserController.deleteMyAccount,
)


// delete user
router.delete('/:id', auth(USER_ROLES.ADMIN), UserController.deleteUser)

export const UserRoutes = router
