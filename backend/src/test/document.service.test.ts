import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../config/database', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
  connection: { end: vi.fn() },
}))

vi.mock('../db/schema', () => ({
  documents: {},
  documentVersions: {},
  sectors: {},
  documentCategories: {},
}))

import { db } from '../config/database'
import {
  listDocuments, getDocument, createDocument,
  deleteDocument, updateDocumentStatus, acquireLock, releaseLock,
} from '../services/document.service'

describe('document.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDocument', () => {
    it('should return a document when found', async () => {
      const mockDoc = { id: 1, title: 'Doc 1', status: 'draft', sectorId: 1 }
      const limitMock = vi.fn().mockResolvedValue([mockDoc])
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
      const fromMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.select as any).mockReturnValue({ from: fromMock })

      const result = await getDocument(1)
      expect(result.id).toBe(1)
      expect(result.title).toBe('Doc 1')
    })

    it('should throw 404 when document not found', async () => {
      const limitMock = vi.fn().mockResolvedValue([])
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
      const fromMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.select as any).mockReturnValue({ from: fromMock })

      await expect(getDocument(999)).rejects.toThrow('Documento não encontrado')
    })
  })

  describe('createDocument', () => {
    it('should create and return a document', async () => {
      const mockDoc = { id: 1, title: 'New Doc', status: 'draft', sectorId: 1, version: 1 }
      const returningMock = vi.fn().mockResolvedValue([mockDoc])
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock })
      const insertMock = vi.fn().mockReturnValue({ values: valuesMock })
      ;(db.insert as any).mockImplementation(insertMock)

      const result = await createDocument({ title: 'New Doc', contentJson: {}, sectorId: 1, authorId: 1 })
      expect(result.title).toBe('New Doc')
      expect(result.status).toBe('draft')
    })
  })

  describe('deleteDocument', () => {
    it('should throw 404 when document not found', async () => {
      const limitMock = vi.fn().mockResolvedValue([])
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
      const fromMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.select as any).mockReturnValue({ from: fromMock })

      await expect(deleteDocument(999)).rejects.toThrow('Documento não encontrado')
    })

    it('should delete document and versions', async () => {
      const mockDoc = { id: 1, title: 'Doc', sectorId: 1 }
      const limitMock = vi.fn().mockResolvedValue([mockDoc])
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
      const fromMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.select as any).mockReturnValue({ from: fromMock })
      ;(db.delete as any).mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) })

      const result = await deleteDocument(1)
      expect(result.deleted).toBe(true)
    })
  })

  describe('updateDocumentStatus', () => {
    it('should throw on invalid status', async () => {
      await expect(updateDocumentStatus(1, 'invalid')).rejects.toThrow('Status inválido')
    })

    it('should update status for valid statuses', async () => {
      const mockDoc = { id: 1, status: 'draft', sectorId: 1 }
      const limitMock = vi.fn().mockResolvedValue([mockDoc])
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
      const fromMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.select as any).mockReturnValue({ from: fromMock })

      const updatedDoc = { id: 1, status: 'published' }
      const returningMock = vi.fn().mockResolvedValue([updatedDoc])
      const setMock = vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ returning: returningMock }) })
      ;(db.update as any).mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ returning: returningMock }) }) })

      const result = await updateDocumentStatus(1, 'published')
      expect(result.status).toBe('published')
    })
  })

  describe('acquireLock', () => {
    it('should acquire lock on unlocked document', async () => {
      const mockDoc = { id: 1, isEditing: false, editingBy: null, editingExpiresAt: null }
      const limitMock = vi.fn().mockResolvedValue([mockDoc])
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
      const fromMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.select as any).mockReturnValue({ from: fromMock })
      ;(db.update as any).mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) })

      const result = await acquireLock(1, 1)
      expect(result.locked).toBe(true)
    })

    it('should fail when another user is editing', async () => {
      const mockDoc = { id: 1, isEditing: true, editingBy: 2, editingExpiresAt: new Date(Date.now() + 60000) }
      const limitMock = vi.fn().mockResolvedValue([mockDoc])
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
      const fromMock = vi.fn().mockReturnValue({ where: whereMock })
      ;(db.select as any).mockReturnValue({ from: fromMock })

      await expect(acquireLock(1, 1)).rejects.toThrow('Documento está sendo editado por outro usuário')
    })
  })

  describe('releaseLock', () => {
    it('should release the lock', async () => {
      ;(db.update as any).mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) })

      const result = await releaseLock(1)
      expect(result.locked).toBe(false)
    })
  })
})
