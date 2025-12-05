import mongoose, { Schema } from "mongoose";
import { ISample } from "./sample.types";

const SampleSchema = new Schema<ISample>({
  sampleField: {
    type: String,
  },
});

const Sample =
  mongoose.models.Sample || mongoose.model<ISample>("Sample", SampleSchema);

export default Sample;
