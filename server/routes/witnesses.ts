import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { db } from '../../src/db';
import { witnesses } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(witnesses);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', requireAuth(), async (req, res) => {
  try {
    const { clientId, nombre, cedula, telefono, email, municipio, zona, puesto, mesa, estado, documentoSoporteUrl, observaciones } = req.body;
    await db.insert(witnesses).values({
      clientId: clientId || null,
      nombreCompleto: nombre, cedula, telefono, email, municipio, zona, puestoVotacion: puesto, mesa, estado, documentoSoporteUrl, observaciones
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cedula, telefono, email, municipio, zona, puesto, mesa, estado, documentoSoporteUrl, observaciones } = req.body;
    await db.update(witnesses).set({
      nombreCompleto: nombre, cedula, telefono, email, municipio, zona, puestoVotacion: puesto, mesa, estado, documentoSoporteUrl, observaciones
    }).where(eq(witnesses.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(witnesses).where(eq(witnesses.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
