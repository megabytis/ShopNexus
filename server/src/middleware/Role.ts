import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './Auth';

export function authorize(authorizedRole: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      const err: any = new Error("User doesn't exist");
      err.statusCode = 401;
      throw err;
    }
    if (req.user.role !== authorizedRole) {
      const err: any = new Error("You aren't Authorized!");
      err.statusCode = 403;
      throw err;
    }
    next();
  };
}
