import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware'
import { asyncHandler } from '../lib/async-handler'
import { db } from '../config/database'
import { documents, sectors, users, trainingProgress, documentCategories } from '../db/schema'
import { eq } from 'drizzle-orm'

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

  const totalCompleted = (await db.select().from(trainingProgress)
    .where(eq(trainingProgress.status, 'completed'))).length

  const totalCategories = (await db.select().from(documentCategories)).length

  const docsBySector: Record<string, number> = {}
  for (const d of allDocs) {
    const key = String(d.sectorId)
    docsBySector[key] = (docsBySector[key] || 0) + 1
  }

  res.json({
    totalDocs, publishedDocs, draftDocs, archivedDocs,
    totalSectors, totalUsers, totalCompleted, totalCategories, docsBySector,
  })
}))

export default router
