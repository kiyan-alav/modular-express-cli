import { NextFunction, Response } from "express";
import jsonWebToken from "jsonwebtoken";
import { ENV } from "../configs/env";
import { AuthRequest, JwtPayloadCustom } from "../modules/auth/auth.types";
import { ApiError } from "../utils/ApiError";
import { catchAsync } from "../utils/catchAsync";

export const authMiddleware = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "No token provided");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jsonWebToken.verify(
      token,
      ENV.ACCESS_TOKEN_KEY
    ) as JwtPayloadCustom;

    Reflect.deleteProperty(decoded, "password");

    req.user = decoded;

    next();
  }
);

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, "Access denied");
    }
    next();
  };
};
