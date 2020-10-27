import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Schema } from 'joi';

type RequestValidationobject = 'body' | 'query';

export const validate = (
  schema: Schema,
  obj: RequestValidationobject = 'body'
) => (req: Request, res: Response, next: () => void) => {
  const { error } = schema.validate(req[obj]);

  if (error) {
    const { details } = error;
    const error_messages = details.map(({ message }) => message);
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      error_messages,
    });
  } else return next();
};
