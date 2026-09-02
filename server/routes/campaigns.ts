import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { db } from '../../src/db';
import { campaigns } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(campaigns);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', requireAuth(), async (req, res) => {
  try {
    const { clientId, nombre, candidatoNombre, cargoPostulacion, departamento, municipio, circunscripcion, metaVotos, presupuestoTotal, estado, descripcion } = req.body;
    await db.insert(campaigns).values({
      clientId: clientId || null,
      nombre, candidatoNombre, cargoPostulacion, departamento, municipio, circunscripcion, metaVotos, presupuestoTotal: presupuestoTotal?.toString(), estado, descripcion
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, candidatoNombre, cargoPostulacion, departamento, municipio, circunscripcion, metaVotos, presupuestoTotal, estado, descripcion } = req.body;
    await db.update(campaigns).set({
      nombre, candidatoNombre, cargoPostulacion, departamento, municipio, circunscripcion, metaVotos, presupuestoTotal: presupuestoTotal?.toString(), estado, descripcion
    }).where(eq(campaigns.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(campaigns).where(eq(campaigns.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
