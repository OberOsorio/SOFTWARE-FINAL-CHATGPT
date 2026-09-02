import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { db } from '../../src/db';
import { voters, leaders, jurors, witnesses } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get voter status
router.get('/voter/:cedula', requireAuth(), async (req, res) => {
  try {
    const { cedula } = req.params;
    const cleanDoc = cedula.replace(/\D/g, '');

    // Query Voter
    const voterRecord = await db.select().from(voters).where(eq(voters.cedula, cleanDoc)).limit(1);
    
    // Query Leader
    const leaderRecord = await db.select().from(leaders).where(eq(leaders.cedula, cleanDoc)).limit(1);
    
    // Query Juror
    const jurorRecord = await db.select().from(jurors).where(eq(jurors.cedula, cleanDoc)).limit(1);
    
    // Query Witness
    const witnessRecord = await db.select().from(witnesses).where(eq(witnesses.cedula, cleanDoc)).limit(1);

    if (voterRecord.length === 0 && leaderRecord.length === 0 && jurorRecord.length === 0 && witnessRecord.length === 0) {
      return res.status(404).json({ error: 'Ciudadano no encontrado en la base de datos local' });
    }

    const data = {
      isVoter: voterRecord.length > 0,
      voterData: voterRecord[0] || null,
      isLeader: leaderRecord.length > 0,
      leaderData: leaderRecord[0] || null,
      isJuror: jurorRecord.length > 0,
      jurorData: jurorRecord[0] || null,
      isWitness: witnessRecord.length > 0,
      witnessData: witnessRecord[0] || null,
      registraduriaData: null // External lookup will happen here or frontend
    };

    res.json(data);
  } catch (error) {
    console.error('Error fetching electoral data:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Log polling station query
router.post('/query-log', requireAuth(), async (req, res) => {
  try {
    const { cedula, nombre, departamento, municipio, puesto, mesa, exito } = req.body;
    
    // We import pollingStationQueries directly to avoid schema issues, or we should import it at the top
    const { pollingStationQueries } = await import('../../src/db/schema');
    
    await db.insert(pollingStationQueries).values({
      cedula,
      nombre,
      departamento,
      municipio,
      puesto,
      mesa,
      exito,
      ipAddress: req.ip
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error logging query:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
