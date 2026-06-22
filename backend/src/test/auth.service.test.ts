import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

vi.mock('../config/database', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue([{ token: 'mock-refresh-token', expiresAt: new Date() }]) })),
  },
  connection: { end: vi.fn() },
}))

vi.mock('../db/schema', () => ({
  users: {},
  refreshTokens: {},
}))

import { db } from '../config/database'
import { login, getMe } from '../services/auth.service'

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should return token and user on valid credentials', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 10)
      const mockUser = {
        id: 1, name: 'Admin', email: 'admin@test.com',
        role: 'admin', sectorId: 1, isActive: true,
        passwordHash, createdAt: new Date(),
      }

      const limitMock = vi.fn().mockResolvedValue([mockUser])
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
      const fromMock = vi.fn().mockReturnValue({ where: whereMock })

      ;(db.select as any).mockReturnValue({ from: fromMock })

      const result = await login('admin@test.com', 'correct-password')

      expect(result).toHaveProperty('token')
      expect(result.user.email).toBe('admin@test.com')
      expect(result.user.role).toBe('admin')
    })

    it('should throw on invalid email', async () => {
      const limitMock = vi.fn().mockResolvedValue([])
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
      const fromMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.select as any).mockReturnValue({ from: fromMock })

      await expect(login('wrong@test.com', 'password')).rejects.toThrow('Credenciais inválidas')
    })

    it('should throw on inactive user', async () => {
      const passwordHash = await bcrypt.hash('password', 10)
      const mockUser = {
        id: 2, email: 'inactive@test.com', isActive: false,
        passwordHash, name: 'Inactive', role: 'user', sectorId: 1,
        createdAt: new Date(),
      }

      const limitMock = vi.fn().mockResolvedValue([mockUser])
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
      const fromMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.select as any).mockReturnValue({ from: fromMock })

      await expect(login('inactive@test.com', 'password')).rejects.toThrow('Credenciais inválidas')
    })

    it('should throw on wrong password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 10)
      const mockUser = {
        id: 1, email: 'admin@test.com', isActive: true,
        passwordHash, name: 'Admin', role: 'admin', sectorId: 1,
        createdAt: new Date(),
      }

      const limitMock = vi.fn().mockResolvedValue([mockUser])
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
      const fromMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.select as any).mockReturnValue({ from: fromMock })

      await expect(login('admin@test.com', 'wrong-password')).rejects.toThrow('Credenciais inválidas')
    })
  })

  describe('getMe', () => {
    it('should return user data without passwordHash', async () => {
      const mockUser = {
        id: 1, name: 'Admin', email: 'admin@test.com',
        role: 'admin', sectorId: 1,
        passwordHash: 'should-not-appear',
        isActive: true, createdAt: new Date(),
      }

      const limitMock = vi.fn().mockResolvedValue([mockUser])
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
      const fromMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.select as any).mockReturnValue({ from: fromMock })

      const result = await getMe(1)

      expect(result).not.toHaveProperty('passwordHash')
      expect(result.name).toBe('Admin')
    })

    it('should throw when user not found', async () => {
      const limitMock = vi.fn().mockResolvedValue([])
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
      const fromMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.select as any).mockReturnValue({ from: fromMock })

      await expect(getMe(999)).rejects.toThrow('Usuário não encontrado')
    })
  })
})
