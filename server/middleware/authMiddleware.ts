import { Request, Response, NextFunction } from 'express';
import { db } from '../../src/db';
import { profiles } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import { clerkMiddleware as clerkExpressMiddleware, requireAuth as clerkExpressRequireAuth } from '@clerk/express';

export interface AuthenticatedRequest extends Request {
  user?: any;
  clientId?: string | null;
  auth?: any; // Añadido por Clerk
}

const hasClerkSecret = Boolean(process.env.CLERK_SECRET_KEY);

export const safeClerkMiddleware = () => {
  if (hasClerkSecret) {
    try {
      return clerkExpressMiddleware({
        publishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZW5vdWdoLXN1bmJpcmQtMTEyNy5jbGVyay5hY2NvdW50cy5kZXYk',
        secretKey: process.env.CLERK_SECRET_KEY,
      });
    } catch (err) {
      console.warn('Warning initializing clerkMiddleware:', err);
    }
  }
  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
};

export const requireAuth = () => {
  if (hasClerkSecret) {
    try {
      return clerkExpressRequireAuth();
    } catch (err) {
      console.warn('Warning initializing clerk requireAuth:', err);
    }
  }
  return (req: Request, res: Response, next: NextFunction) => {
    return res.status(503).json({
      error: 'El proveedor de autenticación de estas rutas no está configurado.'
    });
  };
};

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Clerk ya procesó el token y pobló req.auth si usamos clerkMiddleware en server.ts
  if (!req.auth || !req.auth.userId) {
    req.user = null;
    req.clientId = null;
    return next();
  }

  const clerkId = req.auth.userId;

  try {
    // Buscar en Drizzle ORM / Memory Store
    const userProfile = await db.select().from(profiles).where(eq(profiles.clerkId, clerkId)).limit(1);

    if (userProfile && userProfile.length > 0) {
      const profile = userProfile[0];
      req.user = { id: profile.id, role: profile.role, clerkId: profile.clerkId };
      req.clientId = profile.clientId || null;
    } else {
      req.user = null;
      req.clientId = null;
    }
  } catch (err) {
    req.user = null;
    req.clientId = null;
  }
  next();
};
