import { db } from '../config/database'
import { notifications } from '../db/schema'
import logger from '../config/logger'
import { emitToUser } from '../socket'

export interface CreateNotificationParams {
  userId: number
  type: 'comment' | 'assignment' | 'status_change' | 'training'
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
