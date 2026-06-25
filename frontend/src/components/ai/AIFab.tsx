import { useState } from 'react'
import AIChatPanel from './AIChatPanel'
import Clippy from './Clippy'

export default function AIFab() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {!open && <Clippy onClick={() => setOpen(true)} />}
      {open && <AIChatPanel onClose={() => setOpen(false)} />}
    </>
  )
}
