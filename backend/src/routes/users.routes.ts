import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, requireRole, AuthRequest } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler, parseIdParam } from '../lib/async-handler'
import { logAudit } from '../lib/audit'
import { AppError } from '../middleware/error.middleware'
import { listUsers, getUser, createUser, updateUser, deleteUser, restoreUser } from '../services/user.service'

const router = Router()
router.use(authMiddleware)

const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['admin', 'user']),
  sectorId: z.number().int().positive(),
})

const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user']).optional(),
  sectorId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
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

router.get('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const id = parseIdParam(req.params.id, 'ID do usuário')
  const user = await getUser(id)
  res.json(user)
}))

router.post('/', requireRole('admin'), validate(createUserSchema), asyncHandler(async (req: AuthRequest, res) => {
  const user = await createUser(req.body)
  await logAudit({ userId: req.user!.userId, action: 'create', entityType: 'user', entityId: user.id, details: { email: user.email } })
  res.status(201).json(user)
}))

router.put('/:id', requireRole('admin'), validate(updateUserSchema), asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID do usuário')
  const user = await updateUser(id, req.body, req.user!.userId)
  await logAudit({ userId: req.user!.userId, action: 'update', entityType: 'user', entityId: id })
  res.json(user)
}))

router.patch('/:id/status', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID do usuário')
  const { isActive } = req.body
  if (typeof isActive !== 'boolean') throw new AppError(400, 'isActive deve ser boolean')
  const user = await updateUser(id, { isActive })
  await logAudit({ userId: req.user!.userId, action: 'toggle_active', entityType: 'user', entityId: id, details: { isActive } })
  res.json(user)
}))

router.delete('/:id', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID do usuário')
  const result = await deleteUser(id)
  await logAudit({ userId: req.user!.userId, action: 'delete', entityType: 'user', entityId: id })
  res.json(result)
}))

router.post('/:id/restore', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID do usuário')
  const result = await restoreUser(id)
  await logAudit({ userId: req.user!.userId, action: 'restore', entityType: 'user', entityId: id })
  res.json(result)
}))

export default router
