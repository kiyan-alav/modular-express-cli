import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    return res
      .status(400)
      .json(new ApiResponse(false, `Upload Error: ${err.message}`));
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(new ApiResponse(false, err.message));
  }

  res.status(500).json(new ApiResponse(false, "Internal Server Error"));
};
