import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Schema } from 'joi';

export const validate = (schema: Schema) => (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { error } = schema.validate(req.body);

  if (error) {
    const { details } = error;
    const error_messages = details.map(({ message }) => message);
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      error_messages,
    });
  } else return next();
};
