import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// @ts-ignore
import { userModel } from '../models/user';

export interface AuthRequest extends Request {
  user?: any;
}

export const userAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      const err: any = new Error("Please Authenticate!");
      err.statusCode = 401;
      throw err;
    }

    const foundUserObj = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as any;

    const foundUser = await userModel.findById(foundUserObj._id);

    if (!foundUser) {
      const err: any = new Error("User not found!");
      err.statusCode = 401;
      throw err;
    }

    req.user = foundUser;

    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      err.statusCode = 401;
      err.message = "Token Expired";
    } else if (err.name === "JsonWebTokenError") {
      err.statusCode = 401;
      err.message = "Invalid Token";
    }
    next(err);
  }
};
