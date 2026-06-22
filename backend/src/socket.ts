import { Server as HTTPServer } from 'http'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from './config/environment'
import logger from './config/logger'

let io: Server | null = null

export function setupSocket(server: HTTPServer) {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token
    if (!token) return next(new Error('Token não fornecido'))

    try {
      const payload = jwt.verify(token as string, env.JWT_SECRET) as any
      ;(socket as any).userId = payload.userId
      next()
    } catch {
      next(new Error('Token inválido'))
    }
  })

  io.on('connection', (socket) => {
    const userId = (socket as any).userId
    socket.join(`user:${userId}`)
    logger.debug(`Socket connected: user ${userId}`)

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: user ${userId}`)
    })
  })

  logger.info('Socket.IO initialized')
  return io
}

export function emitToUser(userId: number, event: string, data: any) {
  if (!io) return
  io.to(`user:${userId}`).emit(event, data)
}

export function getIO() {
  return io
}
