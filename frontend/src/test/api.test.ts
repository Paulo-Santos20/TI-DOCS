import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AxiosError } from 'axios'

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should add Authorization header when token exists', async () => {
    localStorage.setItem('token', 'test-token')

    const api = (await import('../lib/api')).default
    const handlers = api.interceptors.request['handlers']!
    const request = handlers[0]
    const config = request.fulfilled({ headers: {} } as any) as any

    expect(config.headers.Authorization).toBe('Bearer test-token')
  })

  it('should not add Authorization header when no token', async () => {
    const api = (await import('../lib/api')).default
    const handlers = api.interceptors.request['handlers']!
    const request = handlers[0]
    const config = request.fulfilled({ headers: {} } as any) as any

    expect(config.headers.Authorization).toBeUndefined()
  })

  it('should redirect to login on 401', async () => {
    localStorage.setItem('token', 'expired-token')
    localStorage.setItem('mockUser', JSON.stringify({ id: 1, name: 'test' }))

    const api = (await import('../lib/api')).default
    const handlers = api.interceptors.response['handlers']!
    const handler = handlers[0]
    const error = new AxiosError(undefined, undefined, undefined, undefined, {
      status: 401, data: {}, statusText: 'Unauthorized', headers: {}, config: {} as any,
    })

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })

    await expect(handler.rejected!(error)).rejects.toThrow()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('mockUser')).toBeNull()
    expect(window.location.href).toBe('/login')
  })
})
