import { Router } from 'express'
import { z } from 'zod'
import { db } from '../config/database'
import { sectors } from '../db/schema'
import { authMiddleware, requireRole, AuthRequest } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler, parseIdParam } from '../lib/async-handler'
import { logAudit } from '../lib/audit'
import { notifyAllAdmins } from '../services/notification.service'
import { eq } from 'drizzle-orm'

const router = Router()
router.use(authMiddleware)

router.get('/', asyncHandler(async (_req, res) => {
  const result = await db.select().from(sectors)
  res.json(result)
}))

router.post('/', requireRole('admin'), validate(z.object({ name: z.string().min(2) })), asyncHandler(async (req: AuthRequest, res) => {
  const [sector] = await db.insert(sectors).values({ name: req.body.name }).returning()
  await logAudit({ userId: req.user!.userId, action: 'create', entityType: 'sector', entityId: sector.id, ip: req.ip, userAgent: req.headers['user-agent'] })
  await notifyAllAdmins('system', `Setor "${sector.name}" criado`, '/admin/setores')
  res.status(201).json(sector)
}))

router.delete('/:id', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID do setor')
  await db.delete(sectors).where(eq(sectors.id, id))
  await logAudit({ userId: req.user!.userId, action: 'delete', entityType: 'sector', entityId: id, ip: req.ip, userAgent: req.headers['user-agent'] })
  await notifyAllAdmins('system', `Setor #${id} excluído`, '/admin/setores')
  res.json({ deleted: true })
}))

export default router
