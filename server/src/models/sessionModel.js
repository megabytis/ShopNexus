const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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

const sessionModel = mongoose.model("Session", sessionSchema);

module.exports = {
  sessionModel,
};
