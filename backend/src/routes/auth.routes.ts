import { Router } from 'express'
import { z } from 'zod'
import { login, getMe } from '../services/auth.service'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler } from '../lib/async-handler'

const router = Router()

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const result = await login(email, password)
  res.json(result)
}))

router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res) => {
  const user = await getMe(req.user!.userId)
  res.json(user)
}))

export default router
