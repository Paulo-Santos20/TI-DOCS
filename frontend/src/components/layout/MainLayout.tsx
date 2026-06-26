import { ReactNode, useRef, useEffect } from 'react'
import Header from './Header'
import { useLocation } from 'react-router-dom'
import AIFab from '../ai/AIFab'

export default function MainLayout({ children }: { children: ReactNode }) {
  const mainRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main ref={mainRef} className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          {children}
        </div>
      </main>
      <AIFab />
    </div>
  )
}
