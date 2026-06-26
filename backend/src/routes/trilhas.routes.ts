import { Router } from 'express'
import { authMiddleware } from '../middleware'
import { asyncHandler } from '../lib/async-handler'
import * as docService from '../services/document.service'

const router = Router()
router.use(authMiddleware)

router.get('/', asyncHandler(async (req, res) => {
  const sectorId = req.user!.role === 'admin'
    ? (req.query.sectorId ? parseInt(req.query.sectorId as string) : undefined)
    : req.user!.sectorId
  const trilhas = await docService.listTrilhas(sectorId)
  res.json(trilhas)
}))

export default router
