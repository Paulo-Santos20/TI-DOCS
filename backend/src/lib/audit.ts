import { db } from '../config/database'
import { activityLogs } from '../db/schema'

export async function logAudit(params: {
  userId?: number
  action: string
  entityType: string
  entityId?: number
  details?: Record<string, any>
}) {
  await db.insert(activityLogs).values({
    userId: params.userId ?? null,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId ?? null,
    details: params.details ?? null,
  })
}
