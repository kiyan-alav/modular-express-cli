import { Document, FilterQuery, Model, PopulateOptions } from "mongoose";

export async function paginateModel<T extends Document>(
  Model: Model<T>,
  skip: number,
  pageSize: number,
  filter: FilterQuery<T> = {},
  populate: (string | PopulateOptions)[] = [],
  select?: string
) {
  let query = Model.find(filter).skip(skip).limit(pageSize);

  if (select) {
    query = query.select(select);
  }

  for (const p of populate) {
    query = query.populate(typeof p === "string" ? { path: p } : p);
  }

  const [data, totalCount] = await Promise.all([
    query,
    Model.countDocuments(filter),
  ]);

  return { data, totalCount };
}
