import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server exception captured:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Ocurrió un error inesperado en el servidor.'
  });
};
