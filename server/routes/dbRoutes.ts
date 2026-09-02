import express from 'express';
import { dbService } from '../services/dbService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/:table', async (req: AuthenticatedRequest, res, next) => {
  const { table } = req.params;
  try {
    const data = await dbService.select(table, req.clientId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/:table', async (req: AuthenticatedRequest, res, next) => {
  const { table } = req.params;
  const records = Array.isArray(req.body) ? req.body : [req.body];
  try {
    const data = await dbService.insert(table, records, req.clientId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/:table/:id?', async (req: AuthenticatedRequest, res, next) => {
  const { table, id } = req.params;
  const updateData = req.body;
  const { field, value } = req.query;
  try {
    const data = await dbService.update(
      table,
      updateData,
      id,
      field ? String(field) : undefined,
      value,
      req.clientId
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:table/:id?', async (req: AuthenticatedRequest, res, next) => {
  const { table, id } = req.params;
  const { field, value } = req.query;
  try {
    const result = await dbService.delete(
      table,
      id,
      field ? String(field) : undefined,
      value,
      req.clientId
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
