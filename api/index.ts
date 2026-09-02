import type { Request, Response } from 'express';

// Load the Express application inside the invocation so a cold-start import
// error is returned as JSON instead of crashing the entire Vercel function.
// The explicit extension is required because a `server/` directory also exists.
let appPromise: Promise<typeof import('../server.ts')> | null = null;

export default async function handler(req: Request, res: Response) {
  try {
    appPromise ??= import('../server.ts');
    const { default: app } = await appPromise;
    return app(req, res);
  } catch (error) {
    appPromise = null;
    console.error('Vercel server startup failed', { code: 'SERVER_STARTUP_ERROR' });
    return res.status(500).json({
      success: false,
      error: 'No fue posible iniciar el servicio administrativo.'
    });
  }
}
