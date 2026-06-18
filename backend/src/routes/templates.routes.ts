import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, requireRole } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler } from '../lib/async-handler'
import { db } from '../config/database'
import { documents } from '../db/schema'
import { eq, and, desc } from 'drizzle-orm'

const router = Router()
router.use(authMiddleware)

const createSchema = z.object({
  title: z.string().min(3),
  contentJson: z.any().optional().default({}),
  sectorId: z.number().int().positive(),
  templateForSectorId: z.number().int().positive().optional(),
})

router.get('/', asyncHandler(async (req, res) => {
  const templates = await db.select().from(documents)
    .where(eq(documents.isTemplate, true))
    .orderBy(desc(documents.updatedAt))
  res.json(templates)
}))

router.post('/', requireRole('admin'), validate(createSchema), asyncHandler(async (req, res) => {
  const [tmpl] = await db.insert(documents).values({
    title: req.body.title, contentJson: req.body.contentJson || {},
    sectorId: req.body.sectorId, authorId: req.user!.userId,
    status: 'published', isTemplate: true,
    templateForSectorId: req.body.templateForSectorId || null,
  }).returning()
  res.status(201).json(tmpl)
}))

router.put('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const [updated] = await db.update(documents).set({
    title: req.body.title, contentJson: req.body.contentJson,
  }).where(and(eq(documents.id, parseInt(req.params.id)), eq(documents.isTemplate, true))).returning()
  res.json(updated)
}))

router.delete('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  await db.delete(documents).where(and(
    eq(documents.id, parseInt(req.params.id)), eq(documents.isTemplate, true),
  ))
  res.json({ deleted: true })
}))

export default router
