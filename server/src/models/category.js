const mongoose = require("mongoose");
const { Schema } = mongoose;

const categoriesSchema = new Schema(
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

const categoriesModel = mongoose.model("categories", categoriesSchema);

module.exports = { categoriesModel };
