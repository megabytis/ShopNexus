import jwt from "jsonwebtoken";
import crypto from "crypto";

interface User {
  _id: string | object;
  role: string;
}

export const generateAccessToken = (user: User): string => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString("hex");
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
