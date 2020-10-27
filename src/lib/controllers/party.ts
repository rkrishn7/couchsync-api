import { URL_REGEX } from '@app/lib/constants/regex';
import partyService from '@app/lib/services/party';
import { validate } from '@app/lib/utils/middleware';
import { Request, Response, Router } from 'express';
import Joi from 'joi';

const router = Router();

router.post(
  '/create',
  validate(
    Joi.object({
      watchUrl: Joi.string().pattern(new RegExp(URL_REGEX)),
    })
  ),
  async (req: Request, res: Response) => {
    const partyInitData = req.body;

    const partyDetails = await partyService.create(partyInitData);

    return res.status(200).json(partyDetails);
  }
);

export default {
  path: '/party',
  router,
};
