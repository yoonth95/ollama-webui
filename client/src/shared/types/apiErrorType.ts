export class ApiError extends Error {
  statusCode: number;
  errorCode?: string;
  originalError: unknown;

  constructor(message: string, statusCode: number, originalError: unknown, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.originalError = originalError;
    this.name = "ApiError";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
