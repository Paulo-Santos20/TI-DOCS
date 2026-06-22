import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, AuthRequest } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler, parseIdParam } from '../lib/async-handler'
import { db } from '../config/database'
import { documentComments, users } from '../db/schema'
import { AppError } from '../middleware/error.middleware'
import { eq, desc } from 'drizzle-orm'

const router = Router()
router.use(authMiddleware)

const createSchema = z.object({ content: z.string().min(1) })

router.get('/:documentId', asyncHandler(async (req: AuthRequest, res) => {
  const documentId = parseIdParam(req.params.documentId, 'ID do documento')
  const comments = await db.select({
    id: documentComments.id,
    documentId: documentComments.documentId,
    userId: documentComments.userId,
    userName: users.name,
    content: documentComments.content,
    resolved: documentComments.resolved,
    createdAt: documentComments.createdAt,
    updatedAt: documentComments.updatedAt,
  }).from(documentComments)
    .leftJoin(users, eq(documentComments.userId, users.id))
    .where(eq(documentComments.documentId, documentId))
    .orderBy(desc(documentComments.createdAt))
  res.json(comments)
}))

router.post('/:documentId', validate(createSchema), asyncHandler(async (req: AuthRequest, res) => {
  const documentId = parseIdParam(req.params.documentId, 'ID do documento')
  const [comment] = await db.insert(documentComments).values({
    documentId,
    userId: req.user!.userId,
    content: req.body.content,
  }).returning()
  res.status(201).json(comment)
}))

router.patch('/:id/resolve', asyncHandler(async (req, res) => {
  const id = parseIdParam(req.params.id, 'ID do comentário')
  const [comment] = await db.update(documentComments).set({
    resolved: req.body.resolved ?? true,
  }).where(eq(documentComments.id, id)).returning()
  if (!comment) throw new AppError(404, 'Comentário não encontrado')
  res.json(comment)
}))

router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID do comentário')
  const [comment] = await db.select().from(documentComments)
    .where(eq(documentComments.id, id)).limit(1)
  if (!comment) throw new AppError(404, 'Comentário não encontrado')
  if (comment.userId !== req.user!.userId && req.user!.role !== 'admin') {
    throw new AppError(403, 'Sem permissão')
  }
  await db.delete(documentComments).where(eq(documentComments.id, comment.id))
  res.json({ deleted: true })
}))

export default router
