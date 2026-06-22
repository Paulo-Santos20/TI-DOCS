import { beforeAll, afterAll } from 'vitest'

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret'
  process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test'
})

afterAll(() => {
  // cleanup
})
