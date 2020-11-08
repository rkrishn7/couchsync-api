import { NextFunction, Request, RequestHandler, Response } from 'express';

export const wrap = (handler: RequestHandler) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (handler) {
    const result = handler(req, res, next);
    if (result?.catch) {
      result.catch((e: Error) => next(e));
    }
  }
};
