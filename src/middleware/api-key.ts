import type { RequestHandler } from 'express';
import { config } from '../config.js';
import { ApiError } from '../lib/errors.js';

export const apiKeyAuth: RequestHandler = (req, _res, next) => {
  const key = req.headers['x-api-key'] as string | undefined;
  if (!key) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'missing api key'));
  }
  if (key !== config.ATTACKS_API_KEY) {
    return next(new ApiError(403, 'FORBIDDEN', 'invalid api key'));
  }
  next();
};
