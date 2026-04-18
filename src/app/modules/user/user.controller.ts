import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { UserServices } from './user.service'
import { IUser } from './user.interface'
import config from '../../../config'
import { JwtPayload } from 'jsonwebtoken'



// Update Profile
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.updateProfile(req.user! as JwtPayload, req.body)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile updated successfully',
  })
})

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUser(req.query)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User fetched successfully',
    data: {...result},
  })
})

// get single user
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getSingleUser(req.params.id)
  sendResponse<IUser>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User fetched successfully',
    data: result,
  })
})



// delete user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.deleteUser(req.params.id)
  sendResponse<IUser>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User deleted successfully',
  })
})

// get profile
const getProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getProfile(req.user! as JwtPayload)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile fetched successfully',
    data: result,
  })
})

// block user
const blocOrUnblockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.blocOrUnblockUser(req.params.id)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User blocked successfully',
  })
})


// delete my account
const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.deleteMyAccount(req.user! as JwtPayload, req.body)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Account deleted successfully",
  })
})

const getOnboardingUrl = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getOnboardingUrl(req.user! as JwtPayload)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Onboarding URL fetched successfully',
    data: result,
  })
})

const syncStripeStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.syncStripeStatus(req.user! as JwtPayload)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Stripe status synced successfully',
    data: result,
  })
})



export const UserController = {
  getAllUser,
  updateProfile,
  getSingleUser,
  deleteUser,
  getProfile,
  deleteMyAccount,
  getOnboardingUrl,
  syncStripeStatus,
  blocOrUnblockUser
}
