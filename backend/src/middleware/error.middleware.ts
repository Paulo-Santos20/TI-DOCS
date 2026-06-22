import { Request, Response, NextFunction } from 'express'
import logger from '../config/logger'

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }
  logger.error('Unexpected error:', err)
  return res.status(500).json({ error: 'Erro interno do servidor' })
}
