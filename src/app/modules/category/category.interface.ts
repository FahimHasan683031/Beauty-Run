import { Types } from "mongoose";

export interface ICategory {
  _id: Types.ObjectId;
  id: string;
  name: string;
  image: string;
}
