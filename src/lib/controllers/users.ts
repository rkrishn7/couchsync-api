import UserService from '@app/lib/services/users';
import { validate } from '@app/lib/utils/middleware';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';

const router = Router();

router.post(
  '/changeName',
  validate(
    Joi.object({
      newUserName: Joi.string().required(),
      socketId: Joi.string().required(),
    }),
  ),
  async (req: Request, res: Response) => {
    const newUserName = req.body;

    await UserService.changeName(newUserName);

    return res.status(StatusCodes.OK);
  }
);

export default {
  path: '/user',
  router,
};