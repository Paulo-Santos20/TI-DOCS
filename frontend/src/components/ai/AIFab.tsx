import { useState } from 'react'
import AIChatPanel from './AIChatPanel'

export default function AIFab() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-clinical-600 text-white rounded-full shadow-lg hover:bg-clinical-700 transition-all duration-200 flex items-center justify-center text-2xl z-40 hover:scale-105 active:scale-95"
        title="Perguntar à IA"
      >
        🤖
      </button>

      {open && <AIChatPanel onClose={() => setOpen(false)} />}
    </>
  )
}
