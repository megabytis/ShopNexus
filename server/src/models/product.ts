import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description?: string;
  price: number;
  stock: number;
  image: string;
  category: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      index: true,
    },
    image: {
      type: String,
      default: "",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "categories",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });
productSchema.index({ createdAt: -1 });

export const productModel = mongoose.model<IProduct>("products", productSchema);
