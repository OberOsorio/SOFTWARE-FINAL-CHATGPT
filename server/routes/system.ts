import { Router } from 'express';
import { db } from '../../src/db';
import { profiles, clients } from '../../src/db/schema';
import { sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/authMiddleware';
import { randomUUID } from 'crypto';

const router = Router();

// Endpoint for checking if the system has at least one user
router.get('/setup-status', async (req, res) => {
  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(profiles);
    const count = Number(result[0]?.count || 0);
    
    return res.json({
      isInitialized: count > 0,
      usersCount: count
    });
  } catch (err) {
    console.error('Error checking setup status:', err);
    return res.status(500).json({ error: 'Error verificando estado del sistema' });
  }
});

// Endpoint to register the first admin user
router.post('/setup-admin', requireAuth(), async (req, res) => {
  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(profiles);
    const count = Number(result[0]?.count || 0);

    if (count > 0) {
      return res.status(403).json({ error: 'El sistema ya tiene usuarios. Registro bloqueado.' });
    }

    const clerkId = (req as any).auth.userId;
    const { email, displayName } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    // Create default client
    const clientId = randomUUID();
    await db.insert(clients).values({
      id: clientId,
      name: 'Cliente Principal',
      email: email,
      plan: 'ENTERPRISE',
      status: 'ACTIVE'
    });

    // Create superadmin profile
    await db.insert(profiles).values({
      id: randomUUID(),
      clerkId: clerkId,
      clientId: clientId,
      email: email,
      displayName: displayName || email.split('@')[0],
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      allowedModules: ['ADMINISTRATIVE', 'TERRITORY', 'STRATEGY', 'CRM', 'ELECTORAL', 'COMMUNICATIONS', 'ANALYSIS']
    });

    return res.json({ success: true, message: 'Administrador principal creado correctamente.' });
  } catch (err) {
    console.error('Error in /setup-admin:', err);
    return res.status(500).json({ error: 'Error al crear administrador' });
  }
});

export default router;
