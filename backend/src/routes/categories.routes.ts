import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, requireRole, AuthRequest } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler, parseIdParam } from '../lib/async-handler'
import * as docService from '../services/document.service'

const router = Router()
router.use(authMiddleware)

const createSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  parentId: z.number().int().positive().optional(),
  sectorId: z.number().int().positive().optional(),
})

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  parentId: z.number().int().positive().nullable().optional(),
  sectorId: z.number().int().positive().nullable().optional(),
})

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const sectorId = req.user!.role === 'admin'
    ? (req.query.sectorId ? parseInt(req.query.sectorId as string) : undefined)
    : req.user!.sectorId
  const categories = await docService.listCategories(sectorId)
  res.json(categories)
}))

router.post('/', requireRole('admin'), validate(createSchema), asyncHandler(async (req: AuthRequest, res) => {
  const cat = await docService.createCategory(req.body)
  res.status(201).json(cat)
}))

router.put('/:id', requireRole('admin'), validate(updateSchema), asyncHandler(async (req, res) => {
  const id = parseIdParam(req.params.id, 'ID da categoria')
  const cat = await docService.updateCategory(id, req.body)
  res.json(cat)
}))

router.delete('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const id = parseIdParam(req.params.id, 'ID da categoria')
  const result = await docService.deleteCategory(id)
  res.json(result)
}))

export default router
