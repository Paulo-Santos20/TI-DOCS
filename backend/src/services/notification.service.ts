import { db } from '../config/database'
import { notifications, users } from '../db/schema'
import { eq } from 'drizzle-orm'
import logger from '../config/logger'
import { emitToUser } from '../socket'

export interface CreateNotificationParams {
  userId: number
  type: 'comment' | 'assignment' | 'status_change' | 'training' | 'system'
  message: string
  link?: string
}

export async function createNotification({ userId, type, message, link }: CreateNotificationParams) {
  const [notification] = await db.insert(notifications).values({
    userId,
    type,
    message,
    link,
  }).returning()
  logger.info(`Notification created for user ${userId}: ${type} - ${message}`)
  emitToUser(userId, 'notification:new', notification)
  return notification
}

export async function notifyAllAdmins(type: CreateNotificationParams['type'], message: string, link?: string) {
  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, 'admin'))
  for (const admin of admins) {
    await createNotification({ userId: admin.id, type, message, link }).catch(err =>
      logger.error(`Failed to notify admin ${admin.id}: ${err.message}`)
    )
  }
}
