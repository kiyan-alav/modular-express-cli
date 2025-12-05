import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";

export const sampleController = {
  action: catchAsync(async (req: Request, res: Response) => {
    // User sampleService.action as business logic
  }),
};
