import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { ISupport } from './support.interface';
import { Support } from './support.model';
import QueryBuilder from '../../builder/QueryBuilder';

// Create support ticket
const createSupport = async (user: JwtPayload, payload: Partial<ISupport>, fileUrl?: string) => {
  const supportData = {
    ...payload,
    user: user.id || user.authId,
  };

  if (fileUrl) {
    supportData.attachment = fileUrl;
  }

  const result = await Support.create(supportData);
  return result;
};

// Get all support tickets (admin)
const getAllSupportTickets = async (query: Record<string, unknown>) => {
  const supportQueryBuilder = new QueryBuilder(
    Support.find().populate('user', 'fullName email image'),
    query
  )
    .filter()
    .sort()
    .paginate();

  const result = await supportQueryBuilder.modelQuery;
  const meta = await supportQueryBuilder.getPaginationInfo();

  return { meta, result };
};

// Get my support tickets
const getMySupportTickets = async (user: JwtPayload, query: Record<string, unknown>) => {
  const supportQueryBuilder = new QueryBuilder(
    Support.find({ user: user.id || user.authId }),
    query
  )
    .filter()
    .sort()
    .paginate();

  const result = await supportQueryBuilder.modelQuery;
  const meta = await supportQueryBuilder.getPaginationInfo();

  return { meta, result };
};

// Get single support ticket
const getSingleSupportTicket = async (id: string, user: JwtPayload) => {
  const ticket = await Support.findById(id).populate('user', 'fullName email image');

  if (!ticket) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Support ticket not found');
  }

  // Allow admin or the ticket owner to view
  if (user.role !== 'admin' && ticket.user._id.toString() !== (user.id || user.authId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to view this ticket');
  }

  return ticket;
};

// Update support ticket status (admin)
const updateSupportStatus = async (id: string, status: 'pending' | 'resolved') => {
  const ticket = await Support.findById(id);

  if (!ticket) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Support ticket not found');
  }

  ticket.status = status;
  await ticket.save();

  return ticket;
};

export const SupportService = {
  createSupport,
  getAllSupportTickets,
  getMySupportTickets,
  getSingleSupportTicket,
  updateSupportStatus,
};
