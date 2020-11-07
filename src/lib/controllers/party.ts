import { URL_REGEX } from '@app/lib/constants/regex';
import { validate } from '@app/lib/utils/middleware';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';

const router = Router();

router.get(
  '/',
  validate(
    Joi.object({
      partyHash: Joi.string().required(),
    }),
    'query'
  ),
  async (req: Request, res: Response) => {
    const party = await req.services.party.getActiveParty({
      partyHash: req.query.partyHash as string,
    });

    if (!party)
      return res.status(StatusCodes.GONE).json({
        error_message:
          "Whoops! It looks like this party isn't available anymore.",
      });

    return res.status(StatusCodes.OK).json(party);
  }
);

router.post(
  '/create',
  validate(
    Joi.object({
      watchUrl: Joi.string().pattern(new RegExp(URL_REGEX)),
    })
  ),
  async (req: Request, res: Response) => {
    const partyInitData = req.body;

    const party = await req.services.party.create(partyInitData);

    return res.status(StatusCodes.OK).json(party);
  }
);

export default {
  path: '/party',
  router,
};
