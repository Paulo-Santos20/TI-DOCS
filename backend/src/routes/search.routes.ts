import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware'
import { asyncHandler } from '../lib/async-handler'
import { db } from '../config/database'
import { documents, sectors } from '../db/schema'
import { eq, desc, or, ilike, and, sql } from 'drizzle-orm'

const router = Router()
router.use(authMiddleware)

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const q = (req.query.q as string || '').trim()
  if (!q) return res.json([])

  const isAdmin = req.user!.role === 'admin'
  const sectorFilter = isAdmin ? undefined : req.user!.sectorId

  let conditions = or(
    ilike(documents.title, `%${q}%`),
    sql`${documents.contentJson}->>'text' ILIKE ${`%${q}%`}`,
  )

  if (sectorFilter) {
    conditions = and(conditions, eq(documents.sectorId, sectorFilter))!
  }

  const results = await db.select({
    id: documents.id, title: documents.title, status: documents.status,
    version: documents.version, sectorId: documents.sectorId,
    sectorName: sectors.name, updatedAt: documents.updatedAt,
  }).from(documents).leftJoin(sectors, eq(documents.sectorId, sectors.id))
    .where(conditions).orderBy(desc(documents.updatedAt)).limit(20)

  res.json(results)
}))

export default router
