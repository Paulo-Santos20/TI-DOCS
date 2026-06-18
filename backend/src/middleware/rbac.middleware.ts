import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.middleware'
import { AppError } from './error.middleware'

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(403, 'Acesso não autorizado')
    }
    next()
  }
}

export function requireSectorAccess(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.user) throw new AppError(401, 'Não autenticado')
  if (req.user.role === 'admin') return next()

  const targetSectorId = parseInt(req.params.sectorId || req.body.sectorId)
  if (req.user.sectorId !== targetSectorId) {
    throw new AppError(403, 'Acesso negado a este setor')
  }
  next()
}
