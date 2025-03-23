export class ApiError extends Error {
  statusCode: number;
  originalError: unknown;

  constructor(message: string, statusCode: number, originalError: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.name = "ApiError";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
