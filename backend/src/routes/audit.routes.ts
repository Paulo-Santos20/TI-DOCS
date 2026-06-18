import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware'
import { asyncHandler } from '../lib/async-handler'
import { db } from '../config/database'
import { activityLogs } from '../db/schema'
import { desc } from 'drizzle-orm'

const router = Router()
router.use(authMiddleware)
router.use(requireRole('admin'))

router.get('/', asyncHandler(async (_req, res) => {
  const logs = await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(100)
  res.json(logs)
}))

export default router
