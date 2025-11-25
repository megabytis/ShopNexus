const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });
productSchema.index({ createdAt: -1 });

const productModel = new mongoose.model("products", productSchema);

module.exports = {
  productModel,
};
