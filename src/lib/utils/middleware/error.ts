import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // need next here in order for handler to be called
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: any
) => {
  console.error(err);
  const message =
    err.name === 'ServiceError' && err.message
      ? err.message
      : 'Something went wrong';
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: message });
};
