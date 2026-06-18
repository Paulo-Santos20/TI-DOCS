import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, requireRole, AuthRequest } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler } from '../lib/async-handler'
import { listUsers, createUser } from '../services/user.service'

const router = Router()
router.use(authMiddleware)

const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['admin', 'user']),
  sectorId: z.number().int().positive(),
})

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  if (req.user!.role !== 'admin') {
    const result = await listUsers(req.user!.sectorId)
    return res.json(result)
  }
  const sectorId = req.query.sectorId ? parseInt(req.query.sectorId as string) : undefined
  const result = await listUsers(sectorId)
  res.json(result)
}))

router.post('/', requireRole('admin'), validate(createUserSchema), asyncHandler(async (req, res) => {
  const user = await createUser(req.body)
  res.status(201).json(user)
}))

export default router
