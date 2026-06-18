import { Router } from 'express'
import { z } from 'zod'
import { db } from '../config/database'
import { sectors } from '../db/schema'
import { authMiddleware, requireRole } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler } from '../lib/async-handler'

const router = Router()
router.use(authMiddleware)

router.get('/', asyncHandler(async (_req, res) => {
  const result = await db.select().from(sectors)
  res.json(result)
}))

router.post('/', requireRole('admin'), validate(z.object({ name: z.string().min(2) })), asyncHandler(async (req, res) => {
  const [sector] = await db.insert(sectors).values({ name: req.body.name }).returning()
  res.status(201).json(sector)
}))

export default router
