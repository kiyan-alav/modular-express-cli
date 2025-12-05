import { Request } from "express";

export function paginateQuery(req: Request) {
  const pageNumber = Number(req.query.pageNumber) || 1;
  const pageSize = Number(req.query.pageSize) || 10;

  return {
    pageNumber,
    pageSize,
    skip: (pageNumber - 1) * pageSize,
  };
}

export function paginateResponse(
  pageNumber: number,
  pageSize: number,
  totalCount: number
) {
  const totalPage = Math.ceil(totalCount / pageSize);

  return {
    pageNumber,
    pageSize,
    totalCount,
    totalPage,
    prevPage: pageNumber > 1 ? pageNumber - 1 : null,
    nextPage: pageNumber < totalPage ? pageNumber + 1 : null,
  };
}
