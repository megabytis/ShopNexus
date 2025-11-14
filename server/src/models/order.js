const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
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
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
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
  },
  { timestamps: true }
);

const orderModel = new mongoose.model("orders", orderSchema);

module.exports = { orderModel };
