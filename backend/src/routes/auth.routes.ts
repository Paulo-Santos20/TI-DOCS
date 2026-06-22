import { Router } from 'express'
import { z } from 'zod'
import { login, getMe, refreshAccessToken } from '../services/auth.service'
import { sendPasswordResetEmail, resetPassword } from '../services/email.service'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler } from '../lib/async-handler'

const router = Router()

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token obrigatório'),
})

router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const result = await login(email, password)
  res.json(result)
}))

router.post('/refresh', validate(refreshSchema), asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  const result = await refreshAccessToken(refreshToken)
  res.json(result)
}))

router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res) => {
  const user = await getMe(req.user!.userId)
  res.json(user)
}))

const forgotSchema = z.object({ email: z.string().email('Email inválido') })
const resetSchema = z.object({
  token: z.string().min(1, 'Token obrigatório'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

router.post('/forgot-password', validate(forgotSchema), asyncHandler(async (req, res) => {
  const result = await sendPasswordResetEmail(req.body.email)
  res.json(result)
}))

router.post('/reset-password', validate(resetSchema), asyncHandler(async (req, res) => {
  const result = await resetPassword(req.body.token, req.body.password)
  res.json(result)
}))

export default router
