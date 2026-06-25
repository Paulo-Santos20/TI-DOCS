import rateLimit from 'express-rate-limit'
import { env } from '../config/environment'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
})

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
})

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições ao assistente IA. Tente novamente em 1 minuto.' },
})

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas buscas. Tente novamente em 1 minuto.' },
})

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.UPLOAD_RATE_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitos uploads. Tente novamente em 1 minuto.' },
})
