import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, requireRole, AuthRequest } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler } from '../lib/async-handler'
import { db } from '../config/database'
import { trainingAssignments } from '../db/schema'
import { eq, desc } from 'drizzle-orm'

const router = Router()
router.use(authMiddleware)

const createSchema = z.object({
  userId: z.number().int().positive(),
  documentId: z.number().int().positive(),
  dueDate: z.string().optional(),
})

router.get('/', requireRole('admin'), asyncHandler(async (req, res) => {
  const all = await db.select().from(trainingAssignments).orderBy(desc(trainingAssignments.createdAt))
  res.json(all)
}))

router.get('/meus', asyncHandler(async (req: AuthRequest, res) => {
  const mine = await db.select().from(trainingAssignments)
    .where(eq(trainingAssignments.userId, req.user!.userId))
    .orderBy(desc(trainingAssignments.createdAt))
  res.json(mine)
}))

router.post('/', requireRole('admin'), validate(createSchema), asyncHandler(async (req: AuthRequest, res) => {
  const [a] = await db.insert(trainingAssignments).values({
    adminId: req.user!.userId,
    userId: req.body.userId,
    documentId: req.body.documentId,
    dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
  }).returning()
  res.status(201).json(a)
}))

router.delete('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  await db.delete(trainingAssignments).where(eq(trainingAssignments.id, parseInt(req.params.id)))
  res.json({ deleted: true })
}))

export default router
