const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const categoriesModel = new mongoose.model("categories", categoriesSchema);

module.exports = {
  categoriesModel,
};
