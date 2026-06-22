import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware'
import { asyncHandler } from '../lib/async-handler'
import { db } from '../config/database'
import { users, documents, sectors, trainingProgress } from '../db/schema'
import { eq, and, sql, desc, gte } from 'drizzle-orm'

const router = Router()
router.use(authMiddleware)

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const isAdmin = req.user?.role === 'admin'
  const currentUserId = req.user!.userId
  const userSectorId = req.user!.sectorId

  const sectorFilter = isAdmin ? undefined : userSectorId

  const allUsers = await db.select({
    id: users.id, name: users.name, sectorId: users.sectorId,
  }).from(users).where(sectorFilter ? eq(users.sectorId, sectorFilter) : undefined)

  const allDocs = await db.select({
    id: documents.id, title: documents.title, sectorId: documents.sectorId,
    updatedAt: documents.updatedAt, status: documents.status,
  }).from(documents).where(eq(documents.isTemplate, false))

  const sectorsList = await db.select({ id: sectors.id, name: sectors.name }).from(sectors)
  const sectorsMap = new Map(sectorsList.map(s => [s.id, s.name]))

  const totalDocs = allDocs.length

  const progressCounts = await db.select({
    userId: trainingProgress.userId,
    documentId: trainingProgress.documentId,
    completed: sql<boolean>`${trainingProgress.status} = 'completed'`.as('completed'),
    completedAt: trainingProgress.completedAt,
  }).from(trainingProgress)

  const progressByUser = new Map<number, Map<number, { completed: boolean; completedAt: string | null }>>()
  for (const p of progressCounts) {
    if (!progressByUser.has(p.userId)) progressByUser.set(p.userId, new Map())
    progressByUser.get(p.userId)!.set(p.documentId, { completed: p.completed, completedAt: p.completedAt as any })
  }

  const usersReport = allUsers.map(u => {
    const userProgress = progressByUser.get(u.id) || new Map()
    let completed = 0
    const documentsData = allDocs.map(d => {
      const prog = userProgress.get(d.id)
      const isCompleted = prog?.completed ?? false
      if (isCompleted) completed++
      return {
        title: d.title,
        sector: sectorsMap.get(d.sectorId ?? 0) || '',
        percentage: isCompleted ? 100 : prog ? 50 : 0,
        lastAccess: prog?.completedAt || null,
        completed: isCompleted,
      }
    })
    return {
      name: u.name,
      sector: sectorsMap.get(u.sectorId ?? 0) || '',
      lastAccess: null as string | null,
      totalProgress: totalDocs > 0 ? Math.round((completed / totalDocs) * 100) : 0,
      documents: documentsData,
    }
  })

  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString()
  const criticalDocs = allDocs
    .filter(d => d.status === 'published' && d.updatedAt && new Date(d.updatedAt) < new Date(ninetyDaysAgo))
    .map(d => ({
      title: d.title,
      sector: sectorsMap.get(d.sectorId ?? 0) || '',
      daysSinceUpdate: Math.floor((Date.now() - new Date(d.updatedAt!).getTime()) / 86400000),
    }))

  const popularDocuments = allDocs.slice(0, 10).map(d => ({ title: d.title, count: 0 }))

  const currentUser = allUsers.find(u => u.id === currentUserId)

  res.json({
    isAdmin,
    users: isAdmin ? usersReport : (currentUser ? usersReport.filter(u => u.name === currentUser.name) : []),
    criticalDocuments: criticalDocs,
    popularDocuments,
    totalDocs,
  })
}))

export default router
