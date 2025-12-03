import mongoose, { Document, Schema, Types } from "mongoose";
import validator from "validator";

export interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  cart: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    maxLength: 30,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    validate(mail: string) {
      if (!validator.isEmail(mail)) {
        throw new Error(`Email Not Valid ${mail}`);
      }
    },
  },
  password: {
    type: String,
    validate(pass: string) {
      if (!validator.isStrongPassword(pass)) {
        throw new Error(`Not a Strong Password: ${pass}`);
      }
    },
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  cart: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "products",
      },
      quantity: {
        type: Number,
        min: 1,
        default: 1,
      },
    },
  ],
});

export const userModel = mongoose.model<IUser>("user", userSchema);
