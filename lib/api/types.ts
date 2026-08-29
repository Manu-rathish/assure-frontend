export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(
    message: string,
    status = 404,
    code = "NOT_FOUND",
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
