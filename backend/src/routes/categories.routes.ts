import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, requireRole, AuthRequest } from '../middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler, parseIdParam } from '../lib/async-handler'
import { notifyAllAdmins } from '../services/notification.service'
import * as docService from '../services/document.service'
import { db } from '../config/database'
import { documentCategories, documents, sectors } from '../db/schema'
import { AppError } from '../middleware/error.middleware'
import { eq, and, isNull, desc, inArray } from 'drizzle-orm'

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

router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id)
  const [cat] = await db.select().from(documentCategories).where(eq(documentCategories.id, id)).limit(1)
  if (!cat) throw new AppError(404, 'Categoria não encontrada')

  if (req.user!.role !== 'admin') {
    const userSector = await db.select({ sectorId: documentCategories.sectorId })
      .from(documentCategories).where(eq(documentCategories.id, id)).limit(1)
    if (userSector.length && userSector[0].sectorId && userSector[0].sectorId !== req.user!.sectorId) {
      throw new AppError(403, 'Acesso negado')
    }
  }

  const children = await db.select().from(documentCategories)
    .where(eq(documentCategories.parentId, id))
    .orderBy(documentCategories.name)

  const childIds = children.map(c => c.id)
  const allIds = [id, ...childIds]

  const docs = await db.select({
    id: documents.id, title: documents.title, status: documents.status,
    version: documents.version, contentType: documents.contentType,
    contentUrl: documents.contentUrl, contentJson: documents.contentJson,
    sectorName: sectors.name, categoryId: documents.categoryId,
    updatedAt: documents.updatedAt, createdAt: documents.createdAt,
  }).from(documents)
    .leftJoin(sectors, eq(documents.sectorId, sectors.id))
    .where(and(
      isNull(documents.deletedAt),
      inArray(documents.categoryId, allIds),
      eq(documents.isTemplate, false),
    ))
    .orderBy(desc(documents.updatedAt))

  const docsByCat: Record<number, typeof docs> = {}
  for (const d of docs) {
    const cid = d.categoryId || id
    if (!docsByCat[cid]) docsByCat[cid] = []
    docsByCat[cid].push(d)
  }

  res.json({
    ...cat,
    documents: docsByCat[id] || [],
    children: children.map(c => ({
      ...c,
      documents: docsByCat[c.id] || [],
    })),
  })
}))

router.post('/', requireRole('admin'), validate(createSchema), asyncHandler(async (req: AuthRequest, res) => {
  const cat = await docService.createCategory(req.body)
  await notifyAllAdmins('system', `Pasta "${cat.name}" criada`, '/admin/categorias')
  res.status(201).json(cat)
}))

router.put('/:id', requireRole('admin'), validate(updateSchema), asyncHandler(async (req, res) => {
  const id = parseIdParam(req.params.id, 'ID da categoria')
  const cat = await docService.updateCategory(id, req.body)
  await notifyAllAdmins('system', `Pasta "${cat.name}" atualizada`, '/admin/categorias')
  res.json(cat)
}))

router.delete('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const id = parseIdParam(req.params.id, 'ID da categoria')
  const result = await docService.deleteCategory(id)
  await notifyAllAdmins('system', `Pasta #${id} excluída`, '/admin/categorias')
  res.json(result)
}))

export default router
