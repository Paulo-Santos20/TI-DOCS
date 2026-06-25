import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, requireRole } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler } from '../lib/async-handler'
import { notifyAllAdmins } from '../services/notification.service'
import { db } from '../config/database'
import { systemConfigs } from '../db/schema'
import { eq, sql } from 'drizzle-orm'

const router = Router()
router.use(authMiddleware)

const configSchema = z.record(z.string(), z.string())

router.get('/', asyncHandler(async (_req, res) => {
  const configs = await db.select().from(systemConfigs)
  const map: Record<string, string | null> = {}
  for (const c of configs) map[c.key] = c.value
  res.json(map)
}))

router.put('/', requireRole('admin'), validate(configSchema), asyncHandler(async (req, res) => {
  const body = req.body as Record<string, string>
  const now = new Date().toISOString()
  for (const [key, value] of Object.entries(body)) {
    await db.insert(systemConfigs).values({ key, value, updatedAt: now as any })
      .onConflictDoUpdate({ target: systemConfigs.key, set: { value, updatedAt: now as any } })
  }
  await notifyAllAdmins('system', 'Configurações do sistema atualizadas')
  res.json({ success: true })
}))

export default router
