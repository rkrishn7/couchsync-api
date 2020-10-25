import partyService from '@app/lib/services/party';
import { Request, Response, Router } from 'express';

const router = Router();

router.post('/create', async (req: Request, res: Response) => {
  console.log(req.body);
  const { watchUrl } = req.body;

  const partyHash = await partyService.create(watchUrl);

  return res.status(200).json({
    partyHash,
  });
});

export default {
  path: '/party',
  router,
};
