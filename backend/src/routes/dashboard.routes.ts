import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware'
import { asyncHandler } from '../lib/async-handler'
import { db } from '../config/database'
import { sql, eq, and } from 'drizzle-orm'
import { documents, sectors, users, trainingProgress, documentCategories } from '../db/schema'

const router = Router()
router.use(authMiddleware)

router.get('/stats', asyncHandler(async (req: AuthRequest, res) => {
  const isAdmin = req.user!.role === 'admin'
  const sectorId = isAdmin ? undefined : req.user!.sectorId
  const sectorFilter = sectorId ? eq(documents.sectorId, sectorId) : undefined

  const [docCounts] = await db.select({
    total: sql<number>`count(*)::int`,
    published: sql<number>`count(*) filter (where ${documents.status} = 'published')::int`,
    draft: sql<number>`count(*) filter (where ${documents.status} = 'draft')::int`,
    archived: sql<number>`count(*) filter (where ${documents.status} = 'archived')::int`,
  }).from(documents).where(sectorFilter ? and(sectorFilter) : undefined)

  const [sectorCount] = await db.select({ count: sql<number>`count(*)::int` }).from(sectors)
  const totalSectors = sectorCount.count

  const [userCount] = await db.select({ count: sql<number>`count(*)::int` })
    .from(users).where(sectorId ? eq(users.sectorId, sectorId) : undefined)
  const totalUsers = userCount.count

  const [catCount] = await db.select({ count: sql<number>`count(*)::int` })
    .from(documentCategories).where(sectorId ? eq(documentCategories.sectorId, sectorId) : undefined)
  const totalCategories = catCount.count

  const docsBySectorRaw = await db.select({
    sectorId: documents.sectorId,
    count: sql<number>`count(*)::int`,
  }).from(documents).groupBy(documents.sectorId)

  const docsBySector: Record<string, number> = {}
  for (const r of docsBySectorRaw) docsBySector[String(r.sectorId)] = r.count

  let totalCompleted = 0
  if (Object.keys(docsBySector).length > 0 || sectorId) {
    const [comp] = await db.select({ count: sql<number>`count(*)::int` })
      .from(trainingProgress)
      .innerJoin(documents, eq(trainingProgress.documentId, documents.id))
      .where(and(
        eq(trainingProgress.status, 'completed'),
        sectorId ? eq(documents.sectorId, sectorId) : undefined,
      ))
    totalCompleted = comp.count
  }

  res.json({
    totalDocs: docCounts.total,
    publishedDocs: docCounts.published,
    draftDocs: docCounts.draft,
    archivedDocs: docCounts.archived,
    totalSectors, totalUsers, totalCompleted, totalCategories, docsBySector,
  })
}))

export default router
