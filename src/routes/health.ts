import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({
    data: {
      status: 'ok',
      version: '3.0.0',
      uptime: Math.floor(process.uptime()),
    },
    meta: null,
    error: null,
  });
});

export default router;
