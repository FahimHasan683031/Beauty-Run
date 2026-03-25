import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IUser } from './user.interface'
import { User } from './user.model'
import { USER_ROLES, USER_STATUS } from '../../../enum/user'
import { JwtPayload } from 'jsonwebtoken'
import { logger } from '../../../shared/logger'
import QueryBuilder from '../../builder/QueryBuilder'
import config from '../../../config'
import { createConnectAccount, createOnboardingUrl, getAccountStatus } from '../../../stripe/stripeConnect'


const getAllUser = async (query: Record<string, unknown>) => {
    const userQueryBuilder = new QueryBuilder(User.find({ status: { $ne: USER_STATUS.DELETED }, role: { $ne: USER_ROLES.ADMIN } }).select('-password -authentication'), query)
        .filter()
        .sort()
        .fields()
        .paginate()


    const users = await userQueryBuilder.modelQuery.lean()
    const paginationInfo = await userQueryBuilder.getPaginationInfo()

    const totalUsers = await User.countDocuments()
    const staticData = { totalUsers }

    return {
        users,
        staticData,
        meta: paginationInfo,
    }
}

const getSingleUser = async (id: string) => {
    const result = await User.findById(id).select('-password -authentication')
    return result
}

// delete User
const deleteUser = async (id: string) => {
    const user = await User.findById(id)
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    const result = await User.findByIdAndUpdate(id, { status: USER_STATUS.DELETED })
    return result
}

const updateProfile = async (
    user: JwtPayload,
    payload: Partial<IUser>
) => {
    const isExistUser = await User.findById(user.authId)

    if (!isExistUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found or deleted.')
    }

    const updatedUser = await User.findOneAndUpdate(
        { _id: user.authId, status: { $ne: USER_STATUS.DELETED } },
        payload,
        { new: true },
    )

    if (!updatedUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update profile')
    }

    return updatedUser
}

const getProfile = async (user: JwtPayload) => {
    const isExistUser = await User.findById(user.authId).lean().select('-password -authentication')
    if (!isExistUser) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            'The requested profile not found or deleted.',
        )
    }

    return isExistUser
}


const deleteMyAccount = async (user: JwtPayload) => {
    const isExistUser = await User.findById(user.authId)
    if (!isExistUser) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            'The requested profile not found or deleted.',
        )
    }

    await User.findByIdAndUpdate(isExistUser._id, { status: USER_STATUS.DELETED })

    return 'Account deleted successfully'
}

const getOnboardingUrl = async (user: JwtPayload) => {
    const isExistUser = await User.findById(user.authId);
    if (!isExistUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (isExistUser.role !== USER_ROLES.VENDOR) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Only vendors can onboard to Stripe Connect');
    }

    let accountId = isExistUser.stripeConnect?.accountId;
    if (!accountId) {
        const account = await createConnectAccount(isExistUser.email);
        accountId = account.id;
        await User.findByIdAndUpdate(user.authId, {
            'stripeConnect.accountId': accountId
        });
    }

    const url = await createOnboardingUrl(accountId);
    return url;
};

const syncStripeStatus = async (user: JwtPayload) => {
    const isExistUser = await User.findById(user.authId);
    if (!isExistUser?.stripeConnect?.accountId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Stripe account not found for this user');
    }

    const status = await getAccountStatus(isExistUser.stripeConnect.accountId);
    
    const updatedUser = await User.findByIdAndUpdate(user.authId, {
        'stripeConnect.detailsSubmitted': status.detailsSubmitted,
        'stripeConnect.payoutsEnabled': status.payoutsEnabled,
        'stripeConnect.onboardingCompleted': status.onboardingCompleted,
    }, { new: true });

    return updatedUser;
}

export const UserServices = {
    updateProfile,
    getAllUser,
    getSingleUser,
    deleteUser,
    getProfile,
    deleteMyAccount,
    getOnboardingUrl,
    syncStripeStatus,
}
