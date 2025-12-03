import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  userAgent?: string;
  ip?: string;
  valid: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    ip: {
      type: String,
    },
    valid: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const sessionModel = mongoose.model<ISession>("Session", sessionSchema);
