import { Types } from 'mongoose';

export interface ISupport {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  files?: string[];
  user: Types.ObjectId;
  status: 'pending' | 'resolved';
  adminReply?: string;
}
