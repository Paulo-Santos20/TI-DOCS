import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { authMiddleware, AuthRequest } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler } from '../lib/async-handler'
import { db } from '../config/database'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { AppError } from '../middleware/error.middleware'

const router = Router()
router.use(authMiddleware)

const updateSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
})

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const [user] = await db.select({
    id: users.id, name: users.name, email: users.email,
    role: users.role, sectorId: users.sectorId,
  }).from(users).where(eq(users.id, req.user!.userId)).limit(1)
  res.json(user)
}))

router.put('/', validate(updateSchema), asyncHandler(async (req: AuthRequest, res) => {
  const data: Record<string, any> = {}
  if (req.body.name) data.name = req.body.name

  if (req.body.newPassword) {
    if (!req.body.currentPassword) throw new AppError(400, 'Senha atual é obrigatória')
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId)).limit(1)
    if (!user) throw new AppError(404, 'Usuário não encontrado')
    const valid = await bcrypt.compare(req.body.currentPassword, user.passwordHash)
    if (!valid) throw new AppError(400, 'Senha atual incorreta')
    data.passwordHash = await bcrypt.hash(req.body.newPassword, 10)
  }

  const [updated] = await db.update(users).set(data).where(eq(users.id, req.user!.userId)).returning()
  res.json({ id: updated.id, name: updated.name, email: updated.email })
}))

export default router
