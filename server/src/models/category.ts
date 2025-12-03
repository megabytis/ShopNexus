import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const categoriesSchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const categoriesModel = mongoose.model<ICategory>("categories", categoriesSchema);
