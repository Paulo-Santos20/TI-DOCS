import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, requireRole, AuthRequest } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler, parseIdParam } from '../lib/async-handler'
import { logAudit } from '../lib/audit'
import * as docService from '../services/document.service'
import { AppError } from '../middleware/error.middleware'
import { createNotification } from '../services/notification.service'

const router = Router()
router.use(authMiddleware)

const createSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  contentType: z.enum(['rich-text', 'pdf', 'video']).optional().default('rich-text'),
  contentUrl: z.string().max(500).optional(),
  contentJson: z.any().optional().default({}),
  sectorId: z.number().int().positive(),
  categoryId: z.number().int().positive().optional(),
})

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const sectorId = req.user!.role === 'admin'
    ? (req.query.sectorId ? parseInt(req.query.sectorId as string) : undefined)
    : req.user!.sectorId
  const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined
  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50))
  const result = await docService.listDocuments(sectorId, categoryId, page, limit)
  res.json(result)
}))

router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID do documento')
  const doc = await docService.getDocument(id)
  if (req.user!.role !== 'admin' && doc.sectorId !== req.user!.sectorId) {
    throw new AppError(403, 'Acesso negado a documentos de outro setor')
  }
  res.json(doc)
}))

router.post('/', requireRole('admin'), validate(createSchema), asyncHandler(async (req: AuthRequest, res) => {
  const doc = await docService.createDocument({ ...req.body, authorId: req.user!.userId })
  await logAudit({ userId: req.user!.userId, action: 'create', entityType: 'document', entityId: doc.id, details: { title: doc.title } })
  res.status(201).json(doc)
}))

router.post('/:id/lock', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID do documento')
  const result = await docService.acquireLock(id, req.user!.userId)
  res.json(result)
}))

router.post('/:id/unlock', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID do documento')
  const result = await docService.releaseLock(id)
  res.json(result)
}))

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  contentType: z.enum(['rich-text', 'pdf', 'video']).optional(),
  contentUrl: z.string().max(500).optional(),
  contentJson: z.any().optional(),
})

router.put('/:id', requireRole('admin'), validate(updateSchema), asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID do documento')
  const doc = await docService.updateDocument(id, req.body, req.user!.userId)
  await logAudit({ userId: req.user!.userId, action: 'update', entityType: 'document', entityId: doc.id })
  res.json(doc)
}))

router.delete('/:id', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID do documento')
  const result = await docService.deleteDocument(id)
  await logAudit({ userId: req.user!.userId, action: 'delete', entityType: 'document', entityId: id })
  res.json(result)
}))

router.patch('/:id/status', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID do documento')
  const { status } = req.body
  if (!status || !['draft', 'review', 'published', 'archived'].includes(status)) {
    throw new AppError(400, 'Status deve ser draft, review, published ou archived')
  }
  const doc = await docService.updateDocumentStatus(id, status)
  await logAudit({ userId: req.user!.userId, action: 'status_change', entityType: 'document', entityId: id, details: { status } })

  if (doc.authorId !== req.user!.userId) {
    await createNotification({
      userId: doc.authorId,
      type: 'status_change',
      message: `Documento "${doc.title}" mudou para "${status}"`,
      link: `/documentos/${id}`,
    })
  }

  res.json(doc)
}))

router.post('/:id/restore', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIdParam(req.params.id, 'ID do documento')
  const result = await docService.restoreDocument(id)
  await logAudit({ userId: req.user!.userId, action: 'restore', entityType: 'document', entityId: id })
  res.json(result)
}))

router.get('/:id/versions', asyncHandler(async (req, res) => {
  const id = parseIdParam(req.params.id, 'ID do documento')
  const versions = await docService.getVersions(id)
  res.json(versions)
}))

export default router
