import { useState } from 'react'
import AIChatPanel from './AIChatPanel'

export default function AIFab() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-clinical-600 text-white rounded-full shadow-lg hover:bg-clinical-700 transition-all duration-200 flex items-center justify-center z-[51] hover:scale-105 active:scale-95"
          title="Perguntar ao Jarvis"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="10" r="3"/>
            <path d="M7 20.7a8 8 0 0 1 10 0"/>
          </svg>
        </button>
      )}

      {open && <AIChatPanel onClose={() => setOpen(false)} />}
    </>
  )
}
