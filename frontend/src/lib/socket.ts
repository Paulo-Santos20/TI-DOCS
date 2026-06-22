import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function connectSocket(token: string) {
  if (socket?.connected) return socket

  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  })

  socket.on('connect_error', () => {
    socket?.close()
    socket = null
  })

  return socket
}

export function disconnectSocket() {
  socket?.close()
  socket = null
}

export function getSocket() {
  return socket
}
