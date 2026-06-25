import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      onClick={() => setDark(!dark)}
      className="glass w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105"
      title="Alternar tema"
      aria-label="Alternar tema"
    >
      <motion.div
        key={dark ? 'moon' : 'sun'}
        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
        transition={{ duration: 0.2 }}
      >
        {dark ? (
          <Moon size={18} className="text-slate-400" />
        ) : (
          <Sun size={18} className="text-amber-500" />
        )}
      </motion.div>
    </button>
  )
}
