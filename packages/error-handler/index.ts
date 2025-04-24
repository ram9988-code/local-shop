export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: string | Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: string | Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}

//Not found error handler
export class NotFoundErrorHandler extends AppError {
  constructor(message = 'Resourse Not Found') {
    super(message, 404, true);
  }
}

//Validation error handler
export class ValidationErrorHandler extends AppError {
  constructor(
    message = 'Invaild request data',
    details?: string | Record<string, unknown>
  ) {
    super(message, 400, true, details);
  }
}

//Authentication error handler
export class AuthenticationErrorHandler extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, true);
  }
}

//Forbidden error handler
export class ForbiddenErrorHandler extends AppError {
  constructor(message = 'Forbidden access') {
    super(message, 403, true);
  }
}

//Database error handler
export class DatabaseErrorHandler extends AppError {
  constructor(message = 'Database error') {
    super(message, 500, true);
  }
}

//Rate limit error handler
export class RateLimitErrorHandler extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, true);
  }
}
