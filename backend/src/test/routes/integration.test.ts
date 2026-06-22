import { describe, it, expect, vi, beforeAll } from 'vitest'
import request from 'supertest'

vi.mock('../../config/database', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
        })),
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue([]),
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn().mockResolvedValue([]),
              })),
            })),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn().mockResolvedValue([{ id: 1 }]) })) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn().mockResolvedValue([]) })) })),
    delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue([]) })),
    execute: vi.fn().mockResolvedValue([]),
  },
  connection: { end: vi.fn() },
}))

vi.mock('../../db/schema', () => ({
  users: { id: 'users.id', name: 'users.name', email: 'users.email', role: 'users.role', sectorId: 'users.sectorId', isActive: 'users.isActive', createdAt: 'users.createdAt', deletedAt: 'users.deletedAt' },
  sectors: { id: 'sectors.id', name: 'sectors.name' },
  documents: { id: 'documents.id', title: 'documents.title', contentJson: 'documents.contentJson', sectorId: 'documents.sectorId', authorId: 'documents.authorId', status: 'documents.status', version: 'documents.version', isTemplate: 'documents.isTemplate', createdAt: 'documents.createdAt', updatedAt: 'documents.updatedAt', deletedAt: 'documents.deletedAt' },
  documentComments: { id: 'documentComments.id', documentId: 'documentComments.documentId', userId: 'documentComments.userId', content: 'documentComments.content', resolved: 'documentComments.resolved', createdAt: 'documentComments.createdAt' },
  notifications: {},
  documentVersions: { id: 'documentVersions.id', documentId: 'documentVersions.documentId' },
  documentCategories: { id: 'documentCategories.id', name: 'documentCategories.name' },
  documentTags: {},
  tags: {},
  trainingAssignments: {},
  trainingProgress: {},
  documentChunks: {},
  activityLogs: {},
  systemConfigs: {},
  refreshTokens: {},
  passwordResetTokens: {},
}))

vi.mock('../../socket', () => ({
  setupSocket: vi.fn(),
  emitToUser: vi.fn(),
  getIO: vi.fn(() => null),
}))

vi.mock('../../config/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

vi.mock('../../services/notification.service', () => ({
  createNotification: vi.fn().mockResolvedValue({}),
}))

vi.mock('../../services/email.service', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ sent: true }),
  resetPassword: vi.fn().mockResolvedValue({ reset: true }),
  isEmailConfigured: vi.fn().mockReturnValue(false),
}))

import app from '../../index'

describe('API Integration', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health')
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('status')
    })
  })

  describe('GET /api/docs', () => {
    it('should serve Swagger UI', async () => {
      const res = await request(app).get('/api/docs/')
      expect(res.status).toBe(200)
      expect(res.text).toContain('swagger')
    })
  })
})
