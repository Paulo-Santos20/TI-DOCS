import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, AuthRequest } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler, parseIdParam } from '../lib/async-handler'
import { db } from '../config/database'
import { documentComments, users, documents } from '../db/schema'
import { AppError } from '../middleware/error.middleware'
import { eq, and, desc } from 'drizzle-orm'
import { createNotification } from '../services/notification.service'

const router = Router()
router.use(authMiddleware)

const createSchema = z.object({ content: z.string().min(1) })

router.get('/:documentId', asyncHandler(async (req: AuthRequest, res) => {
  const documentId = parseIdParam(req.params.documentId, 'ID do documento')
  const [doc] = await db.select({ sectorId: documents.sectorId }).from(documents).where(eq(documents.id, documentId)).limit(1)
  if (!doc) throw new AppError(404, 'Documento não encontrado')
  if (req.user!.role !== 'admin' && doc.sectorId !== req.user!.sectorId) {
    throw new AppError(403, 'Acesso negado a documentos de outro setor')
  }
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

  const [doc] = await db.select({ authorId: documents.authorId, title: documents.title }).from(documents).where(eq(documents.id, documentId)).limit(1)
  if (doc && doc.authorId !== req.user!.userId) {
    await createNotification({
      userId: doc.authorId,
      type: 'comment',
      message: `Novo comentário em "${doc.title}"`,
      link: `/documentos/${documentId}`,
    })
  }

  res.status(201).json(comment)
}))

router.patch('/:id/resolve', asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID do comentário')
  const [existing] = await db.select().from(documentComments).where(eq(documentComments.id, id)).limit(1)
  if (!existing) throw new AppError(404, 'Comentário não encontrado')
  if (existing.userId !== req.user!.userId && req.user!.role !== 'admin') {
    throw new AppError(403, 'Apenas o autor ou admin pode resolver este comentário')
  }
  const [comment] = await db.update(documentComments).set({
    resolved: req.body.resolved ?? true,
  }).where(eq(documentComments.id, id)).returning()
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
