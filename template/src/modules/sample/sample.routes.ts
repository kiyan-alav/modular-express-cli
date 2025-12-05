import { Router } from "express";
import { sampleController } from "./sample.controller";

const sampleRouter = Router();

sampleRouter.get(
  "/test",
  sampleController.sampleController
);

export default sampleRouter;
