import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, requireRole, AuthRequest } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler } from '../lib/async-handler'
import { db } from '../config/database'
import { tags, documentTags } from '../db/schema'
import { eq } from 'drizzle-orm'

const router = Router()
router.use(authMiddleware)

const createSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

router.get('/', asyncHandler(async (_req, res) => {
  const all = await db.select().from(tags)
  res.json(all)
}))

router.post('/', requireRole('admin'), validate(createSchema), asyncHandler(async (req, res) => {
  const [tag] = await db.insert(tags).values({ name: req.body.name, color: req.body.color }).returning()
  res.status(201).json(tag)
}))

router.delete('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  await db.delete(documentTags).where(eq(documentTags.tagId, parseInt(req.params.id)))
  await db.delete(tags).where(eq(tags.id, parseInt(req.params.id)))
  res.json({ deleted: true })
}))

router.post('/document/:documentId', validate(z.object({ tagId: z.number() })), asyncHandler(async (req: AuthRequest, res) => {
  const [dt] = await db.insert(documentTags).values({
    documentId: parseInt(req.params.documentId), tagId: req.body.tagId,
  }).returning()
  res.status(201).json(dt)
}))

router.delete('/document/:documentId/:tagId', asyncHandler(async (req, res) => {
  await db.delete(documentTags).where(
    eq(documentTags.documentId, parseInt(req.params.documentId)),
  )
  await db.delete(documentTags).where(
    eq(documentTags.tagId, parseInt(req.params.tagId)),
  )
  res.json({ deleted: true })
}))

export default router
