import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../config/database', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
  connection: { end: vi.fn() },
}))

vi.mock('../db/schema', () => ({
  users: {},
  sectors: {},
}))

import { db } from '../config/database'
import { listUsers, createUser } from '../services/user.service'

describe('user.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listUsers', () => {
    it('should return all users when no sector filter', async () => {
      const mockUsers = [
        { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin', sectorId: 1, isActive: true, sectorName: 'TI', createdAt: new Date() },
      ]
      let callIndex = 0
      const chainable = () => {
        const chain: any = new Proxy({}, {
          get: (target, prop) => {
            if (prop === 'then') return (resolve: any) => {
              callIndex++
              const val = callIndex === 1 ? [{ count: 1 }] : mockUsers
              return Promise.resolve(val).then(resolve)
            }
            if (prop === 'catch') return vi.fn()
            return () => chain
          },
        })
        return chain
      }
      ;(db.select as any).mockImplementation(chainable)

      const result = await listUsers()
      expect(result.data).toHaveLength(1)
      expect(result.data[0].name).toBe('Admin')
      expect(result.total).toBe(1)
    })

    it('should filter by sectorId when provided', async () => {
      const mockUsers = [
        { id: 2, name: 'User', email: 'user@test.com', role: 'user', sectorId: 2, isActive: true, sectorName: 'Enfermagem', createdAt: new Date() },
      ]
      let callIndex = 0
      const chainable = () => {
        const chain: any = new Proxy({}, {
          get: (target, prop) => {
            if (prop === 'then') return (resolve: any) => {
              callIndex++
              const val = callIndex === 1 ? [{ count: 1 }] : mockUsers
              return Promise.resolve(val).then(resolve)
            }
            if (prop === 'catch') return vi.fn()
            return () => chain
          },
        })
        return chain
      }
      ;(db.select as any).mockImplementation(chainable)

      const result = await listUsers(2)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].sectorId).toBe(2)
    })
  })

  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      const limitMock = vi.fn().mockResolvedValue([])
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
      const fromMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.select as any).mockReturnValue({ from: fromMock })

      const createdUser = { id: 2, name: 'New User', email: 'new@test.com', role: 'user', sectorId: 1, passwordHash: 'hashed' }
      const returningMock = vi.fn().mockResolvedValue([createdUser])
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock })
      const insertMock = vi.fn().mockReturnValue({ values: valuesMock })
      ;(db.insert as any).mockImplementation(insertMock)

      const result = await createUser({
        name: 'New User', email: 'new@test.com',
        password: 'password123', role: 'user', sectorId: 1,
      })

      expect(result.name).toBe('New User')
      expect(result).not.toHaveProperty('passwordHash')
    })

    it('should throw 409 when email already exists', async () => {
      const existingUser = { id: 1, email: 'existing@test.com' }
      const limitMock = vi.fn().mockResolvedValue([existingUser])
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
      const fromMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.select as any).mockReturnValue({ from: fromMock })

      await expect(createUser({
        name: 'Duplicate', email: 'existing@test.com',
        password: 'password123', role: 'user', sectorId: 1,
      })).rejects.toThrow('Email já cadastrado')
    })
  })
})
