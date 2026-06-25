import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const tooltips = [
  'Pergunte sobre documentos do seu setor!',
  'Precisa de ajuda com um POP?',
  'Posso ajudar com treinamentos!',
  'Olá! Precisa de algo?',
  'Tem dúvidas? Estou aqui!',
  'Clique em mim para conversar!',
  'Posso te ajudar a encontrar documentos.',
  'Já leu os novos treinamentos?',
]

interface ClippyProps {
  onClick: () => void
}

export default function Clippy({ onClick }: ClippyProps) {
  const [message, setMessage] = useState('')
  const [showMessage, setShowMessage] = useState(false)
  const [idle, setIdle] = useState(false)

  const pickMessage = useCallback(() => {
    const msg = tooltips[Math.floor(Math.random() * tooltips.length)]
    setMessage(msg)
    setShowMessage(true)
    setTimeout(() => setShowMessage(false), 5000)
  }, [])

  useEffect(() => {
    const swayInterval = setInterval(() => setIdle(i => !i), 3000)
    return () => clearInterval(swayInterval)
  }, [])

  useEffect(() => {
    const t = setTimeout(pickMessage, 3000)
    const msgInterval = setInterval(pickMessage, 18000)
    return () => { clearTimeout(t); clearInterval(msgInterval) }
  }, [pickMessage])

  return (
    <div className="fixed bottom-6 right-6 z-[51]">
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-3 glass-elevated rounded-xl px-4 py-2 text-xs z-[60]"
            style={{ color: 'var(--text-primary)', maxWidth: 220, overflowWrap: 'break-word', whiteSpace: 'normal' }}
          >
            <div className="relative">
              {message}
              <div
                className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45"
                style={{
                  background: 'var(--glass-regular)',
                  backdropFilter: 'blur(24px)',
                  borderRight: '1px solid var(--glass-border)',
                  borderBottom: '1px solid var(--glass-border)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={onClick}
        className="cursor-pointer"
        animate={
          idle
            ? { rotate: [-3, 0, 3, 0, -3], transition: { duration: 2.5, ease: 'easeInOut', repeat: Infinity } }
            : {}
        }
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Perguntar ao Jarvis"
      >
        <div className="w-14 h-14 rounded-2xl glass-strong flex items-center justify-center overflow-hidden p-1">
          <img
            src="/clippy.png"
            alt="Clippy"
            className="w-full h-full object-contain"
          />
        </div>
      </motion.button>
    </div>
  )
}
