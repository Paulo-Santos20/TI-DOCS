import { Request, Response, NextFunction } from 'express'
import { AppError } from '../middleware/error.middleware'

export function asyncHandler(fn: (req: any, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export function parseIdParam(raw: string | undefined, label = 'id'): number {
  const num = parseInt(raw ?? '', 10)
  if (isNaN(num) || num < 1) throw new AppError(400, `${label} inválido`)
  return num
}
