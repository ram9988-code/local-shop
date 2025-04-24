import { NextFunction, Request, Response } from 'express';
import { AppError } from './index';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction // <-- add this
) => {
  if (err instanceof AppError) {
    console.log(
      `Error: ${err.message} \nStatus Code: ${err.statusCode} \nDetails: ${err.details}`
    );

    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    details: 'An unexpected error occurred. Please try again later.',
  });
};
