import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, requireRole, AuthRequest } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler, parseIdParam } from '../lib/async-handler'
import { logAudit } from '../lib/audit'
import { notifyAllAdmins } from '../services/notification.service'
import { db } from '../config/database'
import { tags, documentTags } from '../db/schema'
import { eq, and } from 'drizzle-orm'

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

router.post('/', requireRole('admin'), validate(createSchema), asyncHandler(async (req: AuthRequest, res) => {
  const [tag] = await db.insert(tags).values({ name: req.body.name, color: req.body.color }).returning()
  await logAudit({ userId: req.user!.userId, action: 'create', entityType: 'tag', entityId: tag.id, details: { name: tag.name }, ip: req.ip, userAgent: req.headers['user-agent'] })
  await notifyAllAdmins('system', `Tag "${tag.name}" criada`)
  res.status(201).json(tag)
}))

router.delete('/:id', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID da tag')
  await db.delete(documentTags).where(eq(documentTags.tagId, id))
  await db.delete(tags).where(eq(tags.id, id))
  await logAudit({ userId: req.user!.userId, action: 'delete', entityType: 'tag', entityId: id, ip: req.ip, userAgent: req.headers['user-agent'] })
  await notifyAllAdmins('system', `Tag #${id} excluída`)
  res.json({ deleted: true })
}))

router.get('/document/:documentId', asyncHandler(async (req, res) => {
  const documentId = parseIdParam(req.params.documentId, 'ID do documento')
  const rows = await db.select({ id: tags.id, name: tags.name, color: tags.color })
    .from(documentTags)
    .innerJoin(tags, eq(documentTags.tagId, tags.id))
    .where(eq(documentTags.documentId, documentId))
  res.json(rows)
}))

router.post('/document/:documentId', validate(z.object({ tagId: z.number() })), asyncHandler(async (req: AuthRequest, res) => {
  const documentId = parseIdParam(req.params.documentId, 'ID do documento')
  const [dt] = await db.insert(documentTags).values({
    documentId, tagId: req.body.tagId,
  }).returning()
  await logAudit({ userId: req.user!.userId, action: 'add_tag', entityType: 'document', entityId: documentId, details: { tagId: req.body.tagId }, ip: req.ip, userAgent: req.headers['user-agent'] })
  res.status(201).json(dt)
}))

router.delete('/document/:documentId/:tagId', asyncHandler(async (req: AuthRequest, res) => {
  const documentId = parseIdParam(req.params.documentId, 'ID do documento')
  const tagId = parseIdParam(req.params.tagId, 'ID da tag')
  await logAudit({ userId: req.user!.userId, action: 'remove_tag', entityType: 'document', entityId: documentId, details: { tagId }, ip: req.ip, userAgent: req.headers['user-agent'] })
  await db.delete(documentTags).where(
    and(
      eq(documentTags.documentId, documentId),
      eq(documentTags.tagId, tagId),
    ),
  )
  res.json({ deleted: true })
}))

export default router
