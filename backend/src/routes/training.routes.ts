import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, AuthRequest } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler } from '../lib/async-handler'
import { db } from '../config/database'
import { trainingProgress, documents } from '../db/schema'
import { AppError } from '../middleware/error.middleware'
import { eq, and } from 'drizzle-orm'

const router = Router()
router.use(authMiddleware)

const completeSchema = z.object({
  status: z.enum(['completed', 'in_progress', 'not_started']),
  score: z.number().min(0).max(100).optional(),
})

router.post('/documentos/:id/completar', validate(completeSchema), asyncHandler(async (req: AuthRequest, res) => {
  const docId = parseInt(req.params.id)
  const userId = req.user!.userId
  const { status, score } = req.body

  const [doc] = await db.select().from(documents).where(eq(documents.id, docId)).limit(1)
  if (!doc) throw new AppError(404, 'Documento não encontrado')

  const [existing] = await db.select().from(trainingProgress)
    .where(and(eq(trainingProgress.userId, userId), eq(trainingProgress.documentId, docId)))
    .limit(1)

  if (existing) {
    const [updated] = await db.update(trainingProgress).set({
      status, score: score ?? existing.score,
      completedAt: status === 'completed' ? new Date() : existing.completedAt,
      updatedAt: new Date(),
    }).where(eq(trainingProgress.id, existing.id)).returning()
    res.json(updated)
  } else {
    const [created] = await db.insert(trainingProgress).values({
      userId, documentId: docId, status, score: score ?? 0,
      completedAt: status === 'completed' ? new Date() : null,
    }).returning()
    res.status(201).json(created)
  }
}))

router.get('/documentos/:id', asyncHandler(async (req: AuthRequest, res) => {
  const docId = parseInt(req.params.id)
  const userId = req.user!.userId

  const [progress] = await db.select().from(trainingProgress)
    .where(and(eq(trainingProgress.userId, userId), eq(trainingProgress.documentId, docId)))
    .limit(1)

  res.json(progress || { userId, documentId: docId, status: 'not_started', score: null })
}))

router.get('/meus', asyncHandler(async (req: AuthRequest, res) => {
  const progress = await db.select().from(trainingProgress)
    .where(eq(trainingProgress.userId, req.user!.userId))
    .orderBy(trainingProgress.updatedAt)
  res.json(progress)
}))

export default router
