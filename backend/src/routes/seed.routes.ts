import { Router } from 'express'
import { asyncHandler } from '../lib/async-handler'
import { authMiddleware, requireRole } from '../middleware'

const router = Router()
router.use(authMiddleware, requireRole('admin'))

router.post('/', asyncHandler(async (_req, res) => {
  const { main } = await import('../db/seed')
  try {
    await main()
    res.json({ message: 'Seed executado com sucesso' })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}))

export default router
