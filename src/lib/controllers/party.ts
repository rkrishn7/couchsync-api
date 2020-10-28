import { URL_REGEX } from '@app/lib/constants/regex';
import PartyService from '@app/lib/services/party';
import { validate } from '@app/lib/utils/middleware';
import { Request, Response, Router } from 'express';
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
    const party = await PartyService.get({
      partyHash: req.query.partyHash as string,
    });

    return res.status(200).json(party);
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
    // The init data consists of the watch url
    const partyInitData = req.body;

    const party = await PartyService.create(partyInitData);

    return res.status(200).json(party);
  }
);

export default {
  path: '/party',
  router,
};
