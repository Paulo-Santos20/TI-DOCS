import { Router, Request, Response } from 'express'
import { sql } from 'drizzle-orm'
import { db } from '../config/database'
import { env } from '../config/environment'
import logger from '../config/logger'

const router = Router()
const startTime = Date.now()

router.get('/', async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {}
  let overall: 'ok' | 'degraded' | 'down' = 'ok'

  try {
    await db.execute(sql`SELECT 1`)
    checks.database = 'ok'
  } catch {
    checks.database = 'down'
    overall = 'down'
  }

  try {
    const response = await fetch(`${env.OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) })
    checks.ollama = response.ok ? 'ok' : 'degraded'
    if (response.status >= 500) overall = overall === 'ok' ? 'degraded' : overall
  } catch {
    checks.ollama = 'down'
    overall = overall === 'ok' ? 'degraded' : overall
  }

  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000)

  res.json({
    status: overall,
    uptime: uptimeSeconds,
    checks,
    timestamp: new Date().toISOString(),
  })
})

export default router
