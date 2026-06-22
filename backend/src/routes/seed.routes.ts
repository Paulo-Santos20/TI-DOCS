import { Router } from 'express'
import { asyncHandler } from '../lib/async-handler'
import { db } from '../config/database'
import { sectors, users } from '../db/schema'

const router = Router()

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
