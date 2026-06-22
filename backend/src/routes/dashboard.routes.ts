import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware'
import { asyncHandler } from '../lib/async-handler'
import { db } from '../config/database'
import { documents, sectors, users, trainingProgress, documentCategories } from '../db/schema'
import { eq, and } from 'drizzle-orm'

const router = Router()
router.use(authMiddleware)

router.get('/stats', asyncHandler(async (req: AuthRequest, res) => {
  const isAdmin = req.user!.role === 'admin'
  const sectorFilter = isAdmin ? undefined : req.user!.sectorId

  const docQuery = sectorFilter
    ? db.select().from(documents).where(eq(documents.sectorId, sectorFilter))
    : db.select().from(documents)
  const allDocs = await docQuery

  const totalDocs = allDocs.length
  const publishedDocs = allDocs.filter(d => d.status === 'published').length
  const draftDocs = allDocs.filter(d => d.status === 'draft').length
  const archivedDocs = allDocs.filter(d => d.status === 'archived').length

  const totalSectors = (await db.select().from(sectors)).length
  const totalUsers = sectorFilter
    ? (await db.select().from(users).where(eq(users.sectorId, sectorFilter))).length
    : (await db.select().from(users)).length

  const catQuery = sectorFilter
    ? db.select().from(documentCategories).where(eq(documentCategories.sectorId, sectorFilter))
    : db.select().from(documentCategories)
  const totalCategories = (await catQuery).length

  const docsBySector: Record<string, number> = {}
  for (const d of allDocs) {
    const key = String(d.sectorId)
    docsBySector[key] = (docsBySector[key] || 0) + 1
  }

  const sectorIds = Object.keys(docsBySector).length > 0
    ? Object.keys(docsBySector).map(Number)
    : sectorFilter ? [sectorFilter] : []

  let totalCompleted = 0
  if (sectorIds.length > 0) {
    const rows = await db.select().from(trainingProgress)
      .innerJoin(documents, eq(trainingProgress.documentId, documents.id))
      .where(
        and(eq(trainingProgress.status, 'completed'), ...sectorIds.map(id => eq(documents.sectorId, id))),
      )
    totalCompleted = rows.length
  }

  res.json({
    totalDocs, publishedDocs, draftDocs, archivedDocs,
    totalSectors, totalUsers, totalCompleted, totalCategories, docsBySector,
  })
}))

export default router
