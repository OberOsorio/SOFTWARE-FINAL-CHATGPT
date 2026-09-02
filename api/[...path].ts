import type { Request, Response } from 'express';

// A native Vercel catch-all keeps the complete /api/... URL intact. This is
// intentionally the single production entry point for every Express route.
let appPromise: Promise<typeof import('../server.ts')> | null = null;

export default async function handler(req: Request, res: Response) {
  try {
    appPromise ??= import('../server.ts');
    const { default: app } = await appPromise;
    return app(req, res);
  } catch (error) {
    appPromise = null;
    console.error('Vercel API startup failed', { code: 'SERVER_STARTUP_ERROR' });
    return res.status(500).json({
      success: false,
      error: 'No fue posible iniciar el servicio seguro.'
    });
  }
}
