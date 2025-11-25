const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
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
      validate(status) {
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
      validate(status) {
        const requiredStatus = [
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ];
        if (!requiredStatus.includes(status)) {
          throw new Error("Invalid payment status!");
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

const orderModel = new mongoose.model("orders", orderSchema);

module.exports = { orderModel };
