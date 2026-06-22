import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware'
import { asyncHandler } from '../lib/async-handler'
import { db } from '../config/database'
import { users, documents, sectors, trainingProgress, activityLogs } from '../db/schema'
import { eq, and, sql, desc, lt } from 'drizzle-orm'

const router = Router()
router.use(authMiddleware)

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const isAdmin = req.user?.role === 'admin'
  const userId = req.user!.userId
  const sectorFilter = !isAdmin && req.user?.sectorId
    ? eq(users.sectorId, req.user.sectorId)
    : undefined

  const allUsers = await db.select({
    id: users.id, name: users.name, sectorId: users.sectorId,
  }).from(users).where(sectorFilter ? and(sectorFilter) : undefined)

  const allDocs = await db.select({
    id: documents.id, title: documents.title, sectorId: documents.sectorId,
    updatedAt: documents.updatedAt, status: documents.status,
  }).from(documents).where(eq(documents.isTemplate, false))

  const sectorsMap = new Map<number, string>()
  const allSectors = await db.select().from(sectors)
  for (const s of allSectors) sectorsMap.set(s.id, s.name)

  const userProgress = await db.select({
    user_id: trainingProgress.userId,
    documentId: trainingProgress.documentId,
    status: trainingProgress.status,
    completedAt: trainingProgress.completedAt,
  }).from(trainingProgress)

  const progressByUser: Record<number, any[]> = {}
  for (const p of userProgress) {
    if (!progressByUser[p.user_id]) progressByUser[p.user_id] = []
    progressByUser[p.user_id].push(p)
  }

  const usersReport = allUsers.map(u => {
    const progress = progressByUser[u.id] || []
    const total = allDocs.length

    const userDocs = allDocs.filter(d => !sectorFilter || d.sectorId === u.sectorId)
    const userCompleted = userDocs.length > 0
      ? progress.filter(p => p.status === 'completed' && userDocs.some(d => d.id === p.documentId)).length
      : 0

    return {
      name: u.name,
      sector: sectorsMap.get(u.sectorId ?? 0) || '',
      lastAccess: null as string | null,
      totalProgress: total > 0 ? Math.round((userCompleted / total) * 100) : 0,
      documents: allDocs.map(d => {
        const prog = progress.find(p => p.documentId === d.id)
        return {
          title: d.title,
          sector: sectorsMap.get(d.sectorId ?? 0) || '',
          percentage: prog?.status === 'completed' ? 100 : prog ? 50 : 0,
          lastAccess: prog?.completedAt || null,
          completed: prog?.status === 'completed',
        }
      }),
    }
  })

  const criticalDocs = allDocs
    .filter(d => d.status === 'published' && d.updatedAt)
    .map(d => ({
      title: d.title,
      sector: sectorsMap.get(d.sectorId ?? 0) || '',
      daysSinceUpdate: Math.floor((Date.now() - new Date(d.updatedAt!).getTime()) / 86400000),
    }))
    .filter(d => d.daysSinceUpdate >= 90)

  const popularDocuments = allDocs
    .sort((a, b) => (b.id - a.id))
    .slice(0, 10)
    .map(d => ({ title: d.title, count: 0 }))

  const currentUser = allUsers.find(u => u.id === req.user!.userId)

  res.json({
    isAdmin,
    users: isAdmin ? usersReport : (currentUser ? usersReport.filter(u => u.name === currentUser.name) : []),
    criticalDocuments: criticalDocs,
    popularDocuments,
    totalDocs: allDocs.length,
  })
}))

export default router
