import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button onClick={() => setDark(!dark)}
      className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-200/30 transition-all duration-200" title="Alternar tema">
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
