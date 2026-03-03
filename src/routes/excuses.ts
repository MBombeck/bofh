import { Router } from 'express';
import { z } from 'zod';
import * as excusesService from '../services/excuses.service.js';
import { trackEvent } from '../lib/umami.js';

const router = Router();

// GET /v1/excuses/random?count=N — random excuse(s)
router.get('/v1/excuses/random', (req, res, next) => {
  try {
    const count = z.coerce.number().int().min(1).max(50).optional().parse(req.query.count);

    if (count) {
      const data = excusesService.getRandom(count);
      trackEvent({ name: 'excuse_random', url: '/v1/excuses/random', data: { count } });
      res.set('Cache-Control', 'no-store');
      res.json({ data, meta: { count: data.length, total: excusesService.TOTAL }, error: null });
    } else {
      const [data] = excusesService.getRandom(1);
      trackEvent({ name: 'excuse_random', url: '/v1/excuses/random', data: { count: 1 } });
      res.set('Cache-Control', 'no-store');
      res.json({ data, meta: { total: excusesService.TOTAL }, error: null });
    }
  } catch (err) {
    next(err);
  }
});

// GET /v1/excuses/:id — specific excuse by ID
router.get('/v1/excuses/:id(\\d+)', (req, res, next) => {
  try {
    const id = z.coerce.number().int().min(1).parse((req.params as Record<string, string>).id);
    const data = excusesService.getById(id);
    trackEvent({ name: 'excuse_by_id', url: `/v1/excuses/${id}`, data: { id } });
    res.set('Cache-Control', 'public, max-age=86400');
    res.json({ data, meta: { total: excusesService.TOTAL }, error: null });
  } catch (err) {
    next(err);
  }
});

// GET /v1/excuses — all excuses
router.get('/v1/excuses', (_req, res) => {
  const data = excusesService.getAll();
  trackEvent({ name: 'excuse_all', url: '/v1/excuses' });
  res.set('Cache-Control', 'public, max-age=86400');
  res.json({ data, meta: { count: data.length, total: excusesService.TOTAL }, error: null });
});

export default router;
