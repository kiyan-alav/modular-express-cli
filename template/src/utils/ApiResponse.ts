export class ApiResponse {
  constructor(
    public success: boolean,
    public message: string,
    public data: any = null
  ) {}
}

export class ApiListResponse {
  constructor(
    public success: boolean,
    public message: string,
    public data: any,
    public paginate: {
      pageNumber: number;
      pageSize: number;
      totalCount: number;
      totalPage: number;
      prevPage: number | null;
      nextPage: number | null;
    }
  ) {}
}
