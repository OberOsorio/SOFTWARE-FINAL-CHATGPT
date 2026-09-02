import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { db } from '../../src/db';
import { surveys } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(surveys);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', requireAuth(), async (req, res) => {
  try {
    const { clientId, titulo, descripcion, muestraObjetivo, estado, preguntas } = req.body;
    await db.insert(surveys).values({
      clientId: clientId || null, titulo, descripcion, muestraObjetivo, estado, preguntas
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, muestraObjetivo, estado, preguntas } = req.body;
    await db.update(surveys).set({
      titulo, descripcion, muestraObjetivo, estado, preguntas
    }).where(eq(surveys.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(surveys).where(eq(surveys.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
