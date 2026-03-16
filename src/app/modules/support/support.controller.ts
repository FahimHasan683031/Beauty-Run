import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SupportService } from './support.service';

const createSupport = catchAsync(async (req: Request, res: Response) => {
  // Use the uploaded file path if available
  let fileUrl = '';
  if (req.files && 'attachment' in req.files) {
    const files = req.files['attachment'] as Express.Multer.File[];
    if (files.length > 0) {
      fileUrl = files[0].path;
    }
  } else if (req.file) {
    fileUrl = req.file.path;
  }

  const result = await SupportService.createSupport(req.user!, req.body, fileUrl);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Support ticket created successfully',
    data: result,
  });
});

const getAllSupportTickets = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportService.getAllSupportTickets(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Support tickets retrieved successfully',
    data: result.result,
    meta: result.meta,
  });
});

const getMySupportTickets = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportService.getMySupportTickets(req.user!, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'My support tickets retrieved successfully',
    data: result.result,
    meta: result.meta,
  });
});

const getSingleSupportTicket = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportService.getSingleSupportTicket(req.params.id, req.user!);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Support ticket retrieved successfully',
    data: result,
  });
});

const updateSupportStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const result = await SupportService.updateSupportStatus(req.params.id, status);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Support ticket marked as ${status}`,
    data: result,
  });
});

export const SupportController = {
  createSupport,
  getAllSupportTickets,
  getMySupportTickets,
  getSingleSupportTicket,
  updateSupportStatus,
};
