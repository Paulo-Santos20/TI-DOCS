import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, requireRole, AuthRequest } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler, parseIdParam } from '../lib/async-handler'
import { db } from '../config/database'
import { trainingAssignments, documents } from '../db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { createNotification } from '../services/notification.service'

const router = Router()
router.use(authMiddleware)

const createSchema = z.object({
  userId: z.number().int().positive(),
  documentId: z.number().int().positive(),
  dueDate: z.string().optional(),
})

router.get('/', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50))
  const offset = (page - 1) * limit
  const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(trainingAssignments)
  const data = await db.select().from(trainingAssignments).orderBy(desc(trainingAssignments.createdAt)).limit(limit).offset(offset)
  res.json({ data, total: countResult.count, page, limit })
}))

router.get('/meus', asyncHandler(async (req: AuthRequest, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50))
  const offset = (page - 1) * limit
  const userId = req.user!.userId
  const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(trainingAssignments).where(eq(trainingAssignments.userId, userId))
  const data = await db.select().from(trainingAssignments)
    .where(eq(trainingAssignments.userId, userId))
    .orderBy(desc(trainingAssignments.createdAt)).limit(limit).offset(offset)
  res.json({ data, total: countResult.count, page, limit })
}))

router.post('/', requireRole('admin'), validate(createSchema), asyncHandler(async (req: AuthRequest, res) => {
  const [a] = await db.insert(trainingAssignments).values({
    adminId: req.user!.userId,
    userId: req.body.userId,
    documentId: req.body.documentId,
    dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
  }).returning()

  const [doc] = await db.select({ title: documents.title }).from(documents).where(eq(documents.id, req.body.documentId)).limit(1)
  await createNotification({
    userId: req.body.userId,
    type: 'assignment',
    message: `Você foi atribuído ao treinamento: "${doc?.title || 'Documento'}"`,
    link: `/documentos/${req.body.documentId}`,
  })

  res.status(201).json(a)
}))

router.delete('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const id = parseIdParam(req.params.id, 'ID da atribuição')
  await db.delete(trainingAssignments).where(eq(trainingAssignments.id, id))
  res.json({ deleted: true })
}))

export default router
