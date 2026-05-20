import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[ERROR]', err.message);

  if (err instanceof ZodError) {
    res.status(422).json({
      error: 'Validation error',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
    return;
  }

  if (err.message === 'Not found') {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }

  if (err.message === 'Conflict') {
    res.status(409).json({ error: 'Resource already exists' });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
