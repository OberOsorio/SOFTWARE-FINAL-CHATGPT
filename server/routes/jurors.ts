import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { db } from '../../src/db';
import { jurors } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// GET all jurors
router.get('/', requireAuth(), async (req, res) => {
  try {
    // Ideally filter by clientId associated with Clerk user, but for now return all or filter by query
    const data = await db.select().from(jurors);
    res.json(data);
  } catch (error) {
    console.error('Error fetching jurors:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST new juror
router.post('/', requireAuth(), async (req, res) => {
  try {
    const { client_id, nombre, cedula, telefono, puesto, mesa, cargo, afinidad, observaciones } = req.body;
    
    await db.insert(jurors).values({
      clientId: client_id || null,
      nombreCompleto: nombre,
      cedula,
      telefono,
      puestoAsignado: puesto,
      mesaAsignada: mesa,
      cargo: cargo || 'VOCAL',
      afinidad: afinidad || 'DESCONOCIDO',
      observaciones
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating juror:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT update juror
router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cedula, telefono, puesto, mesa, cargo, afinidad, observaciones } = req.body;
    
    await db.update(jurors).set({
      nombreCompleto: nombre,
      cedula,
      telefono,
      puestoAsignado: puesto,
      mesaAsignada: mesa,
      cargo,
      afinidad,
      observaciones
    }).where(eq(jurors.id, id as string));

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating juror:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE juror
router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(jurors).where(eq(jurors.id, id as string));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting juror:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
