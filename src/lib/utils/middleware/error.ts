import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: any
) => {
  console.error(err);
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ error: 'Something went wrong' });
};
