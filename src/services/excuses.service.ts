import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ApiError } from '../lib/errors.js';

interface RawExcuse {
  id: number;
  quote: string;
  source: string;
  date: string;
}

export interface Excuse {
  id: number;
  excuse: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw: RawExcuse[] = JSON.parse(
  readFileSync(path.join(__dirname, '../data/excuses.json'), 'utf-8'),
);

const excuses: Excuse[] = raw.map((e) => ({ id: e.id, excuse: e.quote }));

export const TOTAL = excuses.length;

export function getRandom(count: number): Excuse[] {
  const limit = Math.min(Math.max(1, count), excuses.length);
  const indices = new Set<number>();

  while (indices.size < limit) {
    indices.add(Math.floor(Math.random() * excuses.length));
  }

  return [...indices].map((i) => excuses[i]);
}

export function getById(id: number): Excuse {
  const excuse = excuses[id - 1];
  if (!excuse) {
    throw new ApiError(404, 'NOT_FOUND', `excuse #${id} not found`);
  }
  return excuse;
}

export function getAll(): Excuse[] {
  return excuses;
}
