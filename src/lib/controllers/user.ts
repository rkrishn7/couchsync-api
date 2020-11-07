import { validate } from '@app/lib/utils/middleware';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import { SocketEvents } from 'lib/socket/events';
import SocketManager from 'lib/socket/server';

const router = Router();

router.put(
  '/profile',
  validate(
    Joi.object({
      name: Joi.string().required(),
      userId: Joi.number().required(),
      avatarUrl: Joi.string().required(),
      partyHash: Joi.string().required(),
    })
  ),
  async (req: Request, res: Response) => {
    const { name, userId, avatarUrl, partyHash } = req.body;

    const { user } = await req.services.users.updateDisplayDetails({
      name,
      userId,
      avatarUrl,
    });

    SocketManager.server
      .in(partyHash)
      .emit(SocketEvents.PARTY_USER_UPDATED, { user });

    return res.status(StatusCodes.OK).json({
      user,
    });
  }
);

export default {
  path: '/user',
  router,
};
