import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { db } from '../../src/db';
import { customRoles, profiles } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(customRoles);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', requireAuth(), async (req, res) => {
  try {
    const { clientId, name, code, description, isActive, isSystem, allowedModules } = req.body;
    await db.insert(customRoles).values({
      clientId: clientId || null, name, code, description, isActive, isSystem, allowedModules
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, isActive, isSystem, allowedModules } = req.body;
    await db.update(customRoles).set({
      name, code, description, isActive, isSystem, allowedModules
    }).where(eq(customRoles.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(customRoles).where(eq(customRoles.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Profiles (Users)
router.get('/profiles', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(profiles);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/profiles', requireAuth(), async (req, res) => {
  try {
    const { id, clerkId, clientId, email, displayName, phone, role, status, allowedModules, customRoleId } = req.body;
    await db.insert(profiles).values({
      id, clerkId, clientId: clientId || null, email, displayName, phone, role, status, allowedModules, customRoleId
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/profiles/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, displayName, phone, role, status, allowedModules, customRoleId } = req.body;
    await db.update(profiles).set({
      email, displayName, phone, role, status, allowedModules, customRoleId
    }).where(eq(profiles.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/profiles/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(profiles).where(eq(profiles.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
