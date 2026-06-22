import { doubleCsrf } from 'csrf-csrf'
import { Request, Response, NextFunction } from 'express'
import logger from '../config/logger'

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
}

const {
  invalidCsrfTokenError,
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'ti-docs-csrf-secret-change-in-production',
  getSessionIdentifier: (req) => req.ip || req.headers['user-agent'] || req.headers['host'] || 'unknown',
  cookieName: 'x-csrf-token',
  cookieOptions,
  size: 64,
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string | undefined,
})

export function csrfTokenHandler(req: Request, res: Response) {
  const token = generateCsrfToken(req, res)
  res.json({ csrfToken: token })
}

export function csrfErrorHandler(err: Error, _req: Request, res: Response, next: NextFunction) {
  if (err === invalidCsrfTokenError) {
    logger.warn('CSRF validation failed')
    return res.status(403).json({ error: 'Token CSRF inválido ou ausente' })
  }
  next(err)
}

export { doubleCsrfProtection }
