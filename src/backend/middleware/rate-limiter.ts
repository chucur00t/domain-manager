import type { NextApiRequest, NextApiResponse } from 'next';
import { LRUCache } from 'lru-cache';

const rateLimiter = new LRUCache({
  max: 500,
  ttl: 60_000 // 1 minute
});

export function getRateLimiter() {
  return {
    check: (req: NextApiRequest, res: NextApiResponse) =>
      new Promise<void>((resolve, reject) => {
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const key = `${ip}:${req.url}`;
        const tokenCount = rateLimiter.get(key) as number || 0;
        
        // Allow 5 requests per 15 minutes for login
        const MAX_REQUESTS = req.url?.includes('/api/auth/login') ? 5 : 100;
        const WINDOW_MS = req.url?.includes('/api/auth/login') ? 15 * 60 * 1000 : 60 * 1000;

        if (tokenCount >= MAX_REQUESTS) {
          reject({
            status: 429,
            message: 'Too Many Requests'
          });
        } else {
          rateLimiter.set(key, tokenCount + 1);
          setTimeout(() => {
            rateLimiter.set(key, tokenCount > 0 ? tokenCount - 1 : 0);
          }, WINDOW_MS);
          resolve();
        }
      })
  };
}