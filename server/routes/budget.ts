import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { db } from '../../src/db';
import { budgetItems } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(budgetItems);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', requireAuth(), async (req, res) => {
  try {
    const { clientId, campaignId, tipo, categoriaCNE, concepto, monto, comprobanteNumero, soporteUrl, beneficiarioNombre, beneficiarioNit, estado, observaciones } = req.body;
    await db.insert(budgetItems).values({
      clientId: clientId || null, campaignId, tipo, categoriaCNE, concepto, monto: monto?.toString(), comprobanteNumero, soporteUrl, beneficiarioNombre, beneficiarioNit, estado, observaciones
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { campaignId, tipo, categoriaCNE, concepto, monto, comprobanteNumero, soporteUrl, beneficiarioNombre, beneficiarioNit, estado, observaciones } = req.body;
    await db.update(budgetItems).set({
      campaignId, tipo, categoriaCNE, concepto, monto: monto?.toString(), comprobanteNumero, soporteUrl, beneficiarioNombre, beneficiarioNit, estado, observaciones
    }).where(eq(budgetItems.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(budgetItems).where(eq(budgetItems.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
