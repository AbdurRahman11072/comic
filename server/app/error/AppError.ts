class AppError extends Error {
  public readonly statusCode: number;
  public readonly success: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
