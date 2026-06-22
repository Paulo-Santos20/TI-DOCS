import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware'
import { asyncHandler, parseIdParam } from '../lib/async-handler'
import { db } from '../config/database'
import { notifications } from '../db/schema'
import { eq, desc, and, count } from 'drizzle-orm'

const router = Router()
router.use(authMiddleware)

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const notifs = await db.select().from(notifications)
    .where(eq(notifications.userId, req.user!.userId))
    .orderBy(desc(notifications.createdAt)).limit(50)
  res.json(notifs)
}))

router.get('/unread-count', asyncHandler(async (req: AuthRequest, res) => {
  const [result] = await db.select({ value: count() }).from(notifications)
    .where(and(eq(notifications.userId, req.user!.userId), eq(notifications.read, false)))
  res.json({ count: Number(result?.value || 0) })
}))

router.patch('/:id/read', asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID da notificação')
  await db.update(notifications).set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, req.user!.userId)))
  res.json({ success: true })
}))

router.post('/read-all', asyncHandler(async (req: AuthRequest, res) => {
  await db.update(notifications).set({ read: true })
    .where(and(eq(notifications.userId, req.user!.userId), eq(notifications.read, false)))
  res.json({ success: true })
}))

export default router
