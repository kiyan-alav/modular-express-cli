import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import path from "path";
import { errorHandler } from "./middlewares/errorHandler";
import sampleRouter from "./modules/sample/sample.routes";
import { setupSwagger } from "./swagger/swagger";

const app = express();

app.use("/public", express.static(path.join(__dirname, "..", "public")));
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * ! Routes
 */
// ! Sample
app.use("/api/sample", sampleRouter);

// ! Error Handler
app.use(errorHandler);

setupSwagger(app);

export default app;
