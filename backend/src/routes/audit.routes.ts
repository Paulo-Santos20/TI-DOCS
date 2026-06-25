import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware'
import { asyncHandler } from '../lib/async-handler'
import { db } from '../config/database'
import { activityLogs, users } from '../db/schema'
import { eq, desc } from 'drizzle-orm'

const router = Router()
router.use(authMiddleware)
router.use(requireRole('admin'))

router.get('/', asyncHandler(async (_req, res) => {
  const logs = await db.select({
    id: activityLogs.id,
    userId: activityLogs.userId,
    userName: users.name,
    userEmail: users.email,
    action: activityLogs.action,
    entityType: activityLogs.entityType,
    entityId: activityLogs.entityId,
    details: activityLogs.details,
    createdAt: activityLogs.createdAt,
  }).from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(100)
  res.json(logs)
}))

export default router
