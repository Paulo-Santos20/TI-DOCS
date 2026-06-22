import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../config/database', () => ({
  db: {
    insert: vi.fn(() => ({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 1, userId: 1, type: 'comment', message: 'Test', link: '/docs/1', read: false }]) }) })),
  },
  connection: { end: vi.fn() },
}))

vi.mock('../db/schema', () => ({
  notifications: {},
}))

vi.mock('../config/logger', () => ({
  default: { info: vi.fn() },
}))

import { createNotification } from '../services/notification.service'

describe('notification.service', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should create a notification', async () => {
    const result = await createNotification({
      userId: 1,
      type: 'comment',
      message: 'Novo comentário',
      link: '/docs/1',
    })
    expect(result.userId).toBe(1)
    expect(result.type).toBe('comment')
    expect(result.message).toBe('Test')
  })
})
