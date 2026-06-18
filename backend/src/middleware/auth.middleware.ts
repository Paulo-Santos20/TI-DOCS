import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/environment'
import { AppError } from './error.middleware'

export interface JwtPayload {
  userId: number
  role: 'admin' | 'user'
  sectorId: number
}

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      throw new AppError(401, 'Token não fornecido')
    }

    const payload = jwt.verify(header.slice(7), env.JWT_SECRET) as JwtPayload
    req.user = payload
    next()
  } catch (err) {
    if (err instanceof AppError) next(err)
    else next(new AppError(401, 'Token inválido ou expirado'))
  }
}
