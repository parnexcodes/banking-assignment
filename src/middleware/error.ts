import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Custom error class for API errors
 */
export class AppError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handling middleware
 */
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let code = error.code || 'INTERNAL_ERROR';

  // Handle specific error types
  if (error.message === 'Username already exists') {
    statusCode = 409;
    code = 'USERNAME_EXISTS';
  } else if (error.message === 'Account number already exists') {
    statusCode = 409;
    code = 'ACCOUNT_EXISTS';
  } else if (error.message === 'User does not exist') {
    statusCode = 404;
    code = 'USER_NOT_FOUND';
  } else if (error.message === 'Insufficient funds') {
    statusCode = 400;
    code = 'INSUFFICIENT_FUNDS';
  } else if (error.message === 'Source account not found') {
    statusCode = 404;
    code = 'SOURCE_ACCOUNT_NOT_FOUND';
  } else if (error.message === 'Destination account not found') {
    statusCode = 404;
    code = 'DESTINATION_ACCOUNT_NOT_FOUND';
  } else if (error.message === 'Account not found') {
    statusCode = 404;
    code = 'ACCOUNT_NOT_FOUND';
  }

  // Log error for debugging
  console.error('API Error:', {
    message,
    statusCode,
    code,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Send error response
  res.status(statusCode).json({
    error: code,
    message,
    timestamp: new Date().toISOString(),
    path: req.url
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
    path: req.url
  });
};

/**
 * Async error wrapper to catch async errors in route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};