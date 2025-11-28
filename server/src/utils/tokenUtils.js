const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "15m" } // Short lived
  );
};

const generateRefreshToken = () => {
  // Random string or JWT.
  // Using a random hex string is often better for opaque refresh tokens,
  // but if we want it stateless-ish (though we are storing in DB), we can use JWT.
  // The prompt says "generate refresh token... store it in DB... set it in cookie".
  // And "Rotate: generate new AT, generate new RT".
  // I'll use a random hex string for the Refresh Token as it's being stored in the DB.
  // This is more secure than a JWT for RT if we are doing database checks anyway.
  return crypto.randomBytes(40).toString("hex");
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
};
