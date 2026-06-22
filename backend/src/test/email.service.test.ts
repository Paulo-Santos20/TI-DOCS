import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../config/database', () => ({
  db: {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([]) })) })) })),
    insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue([{ token: 'test-token', expiresAt: new Date() }]) })),
  },
  connection: { end: vi.fn() },
}))

vi.mock('../db/schema', () => ({
  passwordResetTokens: {},
  users: {},
}))

vi.mock('../config/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

import { isEmailConfigured, sendEmail, sendPasswordResetEmail, resetPassword } from '../services/email.service'

describe('email.service', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('isEmailConfigured should return false without SMTP_HOST', () => {
    expect(isEmailConfigured()).toBe(false)
  })

  it('sendEmail should warn when SMTP not configured', async () => {
    const result = await sendEmail('test@test.com', 'Subject', '<p>Body</p>')
    expect(result).toBe(false)
  })
})
