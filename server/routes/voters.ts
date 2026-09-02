import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { db } from '../../src/db';
import { voters, leaders } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// LIDERES
router.get('/leaders', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(leaders);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/leaders', requireAuth(), async (req, res) => {
  try {
    const { clientId, nombre, cedula, telefono, email, comuna, barrio, puesto, mesa, zonaInfluencia, metaVotos, votosAsegurados, estado } = req.body;
    await db.insert(leaders).values({
      clientId: clientId || null, nombreCompleto: nombre, cedula, telefono, email, comuna, barrio, puesto, mesa, zonaInfluencia, metaVotos, votosAsegurados, estado
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/leaders/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cedula, telefono, email, comuna, barrio, puesto, mesa, zonaInfluencia, metaVotos, votosAsegurados, estado } = req.body;
    await db.update(leaders).set({
      nombreCompleto: nombre, cedula, telefono, email, comuna, barrio, puesto, mesa, zonaInfluencia, metaVotos, votosAsegurados, estado
    }).where(eq(leaders.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/leaders/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(leaders).where(eq(leaders.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// VOTANTES
router.get('/voters', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(voters);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/voters', requireAuth(), async (req, res) => {
  try {
    const { clientId, nombre, cedula, telefono, email, departamento, municipio, comuna, barrio, puesto, mesa, liderId, liderNombre, intencion, status } = req.body;
    await db.insert(voters).values({
      clientId: clientId || null, nombreCompleto: nombre, cedula, telefono, email, departamento, municipio, comuna, barrio, puestoVotacion: puesto, mesa, liderId, liderNombre, intencion, status
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/voters/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cedula, telefono, email, departamento, municipio, comuna, barrio, puesto, mesa, liderId, liderNombre, intencion, status } = req.body;
    await db.update(voters).set({
      nombreCompleto: nombre, cedula, telefono, email, departamento, municipio, comuna, barrio, puestoVotacion: puesto, mesa, liderId, liderNombre, intencion, status
    }).where(eq(voters.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/voters/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(voters).where(eq(voters.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
