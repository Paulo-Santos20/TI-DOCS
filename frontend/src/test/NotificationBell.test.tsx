import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import { BrowserRouter } from 'react-router-dom'
import NotificationBell from '../components/ui/NotificationBell'

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  } as any,
}))

function renderBell() {
  return render(
    <BrowserRouter>
      <NotificationBell />
    </BrowserRouter>,
  )
}

describe('NotificationBell', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should render bell button', () => {
    renderBell()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should show unread count badge', async () => {
    const api = (await import('../lib/api')).default
    ;(api.get as any).mockResolvedValueOnce({ data: { count: 3 } })
    ;(api.get as any).mockResolvedValueOnce({ data: [] })

    renderBell()

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })
})
