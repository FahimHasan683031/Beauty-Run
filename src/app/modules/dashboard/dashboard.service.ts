import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Product } from '../product/product.model';
import { Order } from '../order/order.model';
import { Payment } from '../payment/payment.model';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enum/user';
import { IAdminStats, IVendorStats } from './dashboard.interface';

const getVendorStatsFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>
): Promise<IVendorStats> => {
  const vendorId = new mongoose.Types.ObjectId(user.id || user.authId);
  const targetYear = query.year ? Number(query.year) : new Date().getFullYear();

  // 1. Total Products
  const totalProducts = await Product.countDocuments({ createdBy: vendorId });

  // 2. Total Completed Orders
  const orderCountAgg = await Order.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productObj',
      },
    },
    { $unwind: '$productObj' },
    {
      $match: {
        'productObj.createdBy': vendorId,
        status: 'delivered',
      },
    },
    {
      $count: 'totalOrders',
    },
  ]);
  const totalCompletedOrders = orderCountAgg[0]?.totalOrders || 0;

  // 3. Total Revenue & Monthly Revenue
  // We use the Payment model to accurately track vendor payouts
  const paymentAgg = await Payment.aggregate([
    {
      $lookup: {
        from: 'orders',
        localField: 'referenceId',
        foreignField: '_id',
        as: 'orderObj',
      },
    },
    { $unwind: '$orderObj' },
    {
      $lookup: {
        from: 'products',
        localField: 'orderObj.product',
        foreignField: '_id',
        as: 'productObj',
      },
    },
    { $unwind: '$productObj' },
    {
      $match: {
        'productObj.createdBy': vendorId,
        status: 'settled',
      },
    },
    {
      $facet: {
        totalRevenue: [
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$vendorPayoutAmount' },
            },
          },
        ],
        monthlyRevenue: [
          {
            $match: {
              createdAt: {
                $gte: new Date(`${targetYear}-01-01T00:00:00.000Z`),
                $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
              },
            },
          },
          {
            $group: {
              _id: { $month: '$createdAt' },
              monthlyAmount: { $sum: '$vendorPayoutAmount' },
            },
          },
        ],
      },
    },
  ]);

  const totalRevenue = paymentAgg[0]?.totalRevenue[0]?.totalAmount || 0;

  // Format array into 12 objects with month names
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const rawMonthlyRevenue = paymentAgg[0]?.monthlyRevenue || [];
  const monthlyRevenue = monthNames.map((month, index) => {
    const monthData = rawMonthlyRevenue.find((item: any) => item._id === index + 1);
    return {
      month,
      revenue: monthData ? monthData.monthlyAmount : 0
    };
  });

  return {
    totalRevenue,
    totalProducts,
    totalCompletedOrders,
    monthlyRevenue,
  };
};

const getAdminStatsFromDB = async (
  query: Record<string, unknown>
): Promise<IAdminStats> => {
  const targetYear = query.year ? Number(query.year) : new Date().getFullYear();

  // 1. Basic counts
  const totalProducts = await Product.countDocuments({});
  const totalUsers = await User.countDocuments({});
  const totalCompletedOrders = await Order.countDocuments({ status: 'delivered' });

  // 2. Revenue and Commission Aggregation
  // Total Revenue (Admin Sales): amount - stripeGatewayFee for Admin's products
  // Total Commission: platformCommission + stripeGatewayFee for all vendor sales
  const paymentAgg = await Payment.aggregate([
    {
      $match: {
        status: 'settled',
      },
    },
    {
      $lookup: {
        from: 'orders',
        localField: 'referenceId',
        foreignField: '_id',
        as: 'orderObj',
      },
    },
    { $unwind: '$orderObj' },
    {
      $lookup: {
        from: 'products',
        localField: 'orderObj.product',
        foreignField: '_id',
        as: 'productObj',
      },
    },
    { $unwind: '$productObj' },
    {
      $lookup: {
        from: 'users',
        localField: 'productObj.createdBy',
        foreignField: '_id',
        as: 'creatorObj',
      },
    },
    { $unwind: '$creatorObj' },
    {
      $facet: {
        adminRevenue: [
          {
            $match: {
              'creatorObj.role': USER_ROLES.ADMIN,
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: { $subtract: ['$amount', '$stripeGatewayFee'] } },
            },
          },
        ],
        platformCommission: [
          {
            $match: {
              'creatorObj.role': USER_ROLES.VENDOR,
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: { $subtract: ['$platformCommission', '$stripeGatewayFee'] } },
            },
          },
        ],
        monthlyRevenue: [
          {
            $match: {
              createdAt: {
                $gte: new Date(`${targetYear}-01-01T00:00:00.000Z`),
                $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
              },
            },
          },
          {
            $group: {
              _id: { $month: '$createdAt' },
              monthlyAmount: {
                $sum: {
                  $cond: [
                    { $eq: ['$creatorObj.role', USER_ROLES.ADMIN] },
                    { $subtract: ['$amount', '$stripeGatewayFee'] },
                    { $subtract: ['$platformCommission', '$stripeGatewayFee'] }
                  ]
                }
              },
            },
          },
        ],
      },
    },
  ]);

  const totalRevenue = paymentAgg[0]?.adminRevenue[0]?.totalAmount || 0;
  const totalCommission = paymentAgg[0]?.platformCommission[0]?.totalAmount || 0;

  // 3. Provider (Vendor) Count Aggregation
  const providerAgg = await User.aggregate([
    {
      $match: {
        role: USER_ROLES.VENDOR,
        createdAt: {
          $gte: new Date(`${targetYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Format arrays into 12 objects with month names
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const rawMonthlyRevenue = paymentAgg[0]?.monthlyRevenue || [];
  const monthlyRevenue = monthNames.map((month, index) => {
    const monthData = rawMonthlyRevenue.find((item: any) => item._id === index + 1);
    return {
      month,
      revenue: monthData ? monthData.monthlyAmount : 0
    };
  });

  const monthlyProviderCount = monthNames.map((month, index) => {
    const providerData = providerAgg.find((item: any) => item._id === index + 1);
    return {
      month,
      count: providerData ? providerData.count : 0
    };
  });

  // 4. Yearly User Growth Calculation
  const previousYear = targetYear - 1;
  const currentYearNewUsers = await User.countDocuments({
    createdAt: {
      $gte: new Date(`${targetYear}-01-01T00:00:00.000Z`),
      $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
    },
  });

  const previousYearNewUsers = await User.countDocuments({
    createdAt: {
      $gte: new Date(`${previousYear}-01-01T00:00:00.000Z`),
      $lte: new Date(`${previousYear}-12-31T23:59:59.999Z`),
    },
  });

  let userGrowthYearly = 0;
  if (previousYearNewUsers === 0) {
    userGrowthYearly = currentYearNewUsers > 0 ? 100 : 0;
  } else {
    userGrowthYearly = ((currentYearNewUsers - previousYearNewUsers) / previousYearNewUsers) * 100;
  }

  // User requested to allow values over 100%
  userGrowthYearly = Number(userGrowthYearly.toFixed(2));

  return {
    totalProducts,
    totalUsers,
    totalCompletedOrders,
    totalRevenue,
    totalCommission,
    monthlyRevenue,
    monthlyProviderCount,
    userGrowthYearly,
  };
};

export const DashboardService = {
  getVendorStatsFromDB,
  getAdminStatsFromDB,
};
