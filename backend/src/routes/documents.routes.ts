import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, requireRole, AuthRequest } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler } from '../lib/async-handler'
import * as docService from '../services/document.service'
import { AppError } from '../middleware/error.middleware'

const router = Router()
router.use(authMiddleware)

const createSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  contentJson: z.any().optional().default({}),
  sectorId: z.number().int().positive(),
  categoryId: z.number().int().positive().optional(),
})

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const sectorId = req.user!.role === 'admin'
    ? (req.query.sectorId ? parseInt(req.query.sectorId as string) : undefined)
    : req.user!.sectorId
  const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined
  const result = await docService.listDocuments(sectorId, categoryId)
  res.json(result)
}))

router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const doc = await docService.getDocument(parseInt(req.params.id))
  if (req.user!.role !== 'admin' && doc.sectorId !== req.user!.sectorId) {
    throw new AppError(403, 'Acesso negado a documentos de outro setor')
  }
  res.json(doc)
}))

router.post('/', requireRole('admin'), validate(createSchema), asyncHandler(async (req: AuthRequest, res) => {
  const doc = await docService.createDocument({ ...req.body, authorId: req.user!.userId })
  res.status(201).json(doc)
}))

router.post('/:id/lock', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const result = await docService.acquireLock(parseInt(req.params.id), req.user!.userId)
  res.json(result)
}))

router.post('/:id/unlock', requireRole('admin'), asyncHandler(async (req, res) => {
  const result = await docService.releaseLock(parseInt(req.params.id))
  res.json(result)
}))

router.put('/:id', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const doc = await docService.updateDocument(parseInt(req.params.id), req.body, req.user!.userId)
  res.json(doc)
}))

router.delete('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const result = await docService.deleteDocument(parseInt(req.params.id))
  res.json(result)
}))

router.patch('/:id/status', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const { status } = req.body
  if (!status || !['draft', 'published', 'archived'].includes(status)) {
    throw new AppError(400, 'Status deve ser draft, published ou archived')
  }
  const doc = await docService.updateDocumentStatus(parseInt(req.params.id), status)
  res.json(doc)
}))

router.get('/:id/versions', asyncHandler(async (req, res) => {
  const versions = await docService.getVersions(parseInt(req.params.id))
  res.json(versions)
}))

export default router
