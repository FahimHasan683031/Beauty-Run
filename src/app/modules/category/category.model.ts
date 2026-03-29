import { model, Schema } from "mongoose";
import { ICategory } from "./category.interface";
import { generateFormattedId } from "../../../util/generateId";

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    id: {
      type: String,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.pre('save', async function (next) {
  if (!this.id) {
    this.id = await generateFormattedId('Category', 'CAT');
  }
  next();
});

export const CategoryModel = model<ICategory>("Category", categorySchema);
