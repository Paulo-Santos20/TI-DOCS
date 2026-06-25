import { db } from '../config/database'
import { activityLogs } from '../db/schema'

export async function logAudit(params: {
  userId?: number
  action: string
  entityType: string
  entityId?: number
  details?: Record<string, any>
  ip?: string
  userAgent?: string
}) {
  const enriched = { ...(params.details || {}) }
  if (params.ip) enriched.ip = params.ip
  if (params.userAgent) enriched.userAgent = params.userAgent

  await db.insert(activityLogs).values({
    userId: params.userId ?? null,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId ?? null,
    details: Object.keys(enriched).length > 0 ? enriched : null,
  })
}
