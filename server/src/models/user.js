const mongoose = require("mongoose");
const validator = require("validator");
const { Schema } = mongoose;

const userSchema = new Schema({
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
    validate(mail) {
      if (!validator.isEmail(mail)) {
        throw new Error(`Email Not Valid ${mail}`);
      }
    },
  },
  password: {
    type: String,
    validate(pass) {
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

const userModel = mongoose.model("user", userSchema);

module.exports = { userModel };
