import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { DashboardService } from './dashboard.service';


const getVendorStats = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getVendorStatsFromDB(req.user, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Vendor statistics retrieved successfully',
    data: result,
  });
});

const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getAdminStatsFromDB(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin statistics retrieved successfully',
    data: result,
  });
});

export const DashboardController = {
  getVendorStats,
  getAdminStats,
};
