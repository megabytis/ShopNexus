const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema(
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

const categoriesModel = new mongoose.model("category", categoriesSchema);

module.exports = {
  categoriesModel,
};
