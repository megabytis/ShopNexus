import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
}

export interface IShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: IShippingAddress;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        quantity: {
          type: Number,
          min: 1,
          default: 1,
          required: true,
        },
        priceAtPurchase: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
      validate(status: string) {
        const requiredStatus = ["pending", "paid", "failed"];
        if (!requiredStatus.includes(status)) {
          throw new Error("Invalid payment status!");
        }
      },
    },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
      index: true,
      validate(status: string) {
        const requiredStatus = [
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ];
        if (!requiredStatus.includes(status)) {
          throw new Error("Invalid order status!");
        }
      },
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

export const orderModel = mongoose.model<IOrder>("orders", orderSchema);
