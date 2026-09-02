import express from 'express';
import type { Request, Response } from 'express';
import globalAdminRouter from '../server/routes/globalAdmin.ts';

// Dedicated serverless function for the private Global Admin terminal. Keeping
// it independent from the large local server prevents unrelated dependencies
// from breaking this security-critical API during a Vercel cold start.
const app = express();

app.use(express.json());
app.use('/api/global-admin', globalAdminRouter);

export default function handler(req: Request, res: Response) {
  const incomingUrl = new URL(req.url || '/', 'http://internal.local');
  const forwardedPath = incomingUrl.searchParams.get('path') || (typeof req.query?.path === 'string'
    ? req.query.path
    : Array.isArray(req.query?.path)
      ? req.query.path.join('/')
      : '');

  if (forwardedPath) {
    const search = incomingUrl.searchParams;
    search.delete('path');
    const suffix = search.toString();
    req.url = `/api/global-admin/${forwardedPath}${suffix ? `?${suffix}` : ''}`;
  }

  return app(req, res);
}
