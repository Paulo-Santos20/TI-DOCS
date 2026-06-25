import { useState, FormEvent, useRef, useEffect } from 'react'
import api from '../../lib/api'
import { X, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message { role: 'user' | 'assistant'; content: string }

const STORAGE_KEY = 'ai-chat-messages'

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveMessages(messages: Message[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
}

export default function AIChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>(loadMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (!loading) saveMessages(messages)
  }, [messages, loading])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setInput('')

    try {
      const { data } = await api.post('/ai/ask', { question: input })
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
    } catch (err: any) {
      const backendMsg = err?.response?.data?.error
      const isTimeout = err?.code === 'ECONNABORTED'
      const isNetwork = err?.code === 'ERR_NETWORK' || !err?.response
      let msg: string
      if (isTimeout) msg = 'A IA demorou muito para responder. Tente novamente.'
      else if (isNetwork) msg = 'Erro de conexão com o servidor de IA.'
      else if (backendMsg) msg = backendMsg
      else msg = 'Erro ao processar sua pergunta. Tente novamente.'
      setMessages(prev => [...prev, { role: 'assistant', content: msg }])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed right-0 top-0 h-full z-50 w-full max-w-md"
    >
      <div className="h-full glass-elevated flex flex-col rounded-l-2xl"
        style={{ borderLeft: '1px solid var(--glass-border-strong)' }}>
        <div className="px-4 py-3 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid var(--glass-border-strong)' }}>
          <div className="flex items-center gap-2">
            <img src="/clippy.png" alt="Clippy" className="w-6 h-6 object-contain" />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Jarvis</h3>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button onClick={handleClear}
                className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--red-500)'; e.currentTarget.style.background = 'var(--red-50)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
                aria-label="Limpar conversa">
                <Trash2 size={14} />
                Limpar
              </button>
            )}
            <button onClick={onClose}
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
              aria-label="Fechar">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-center mt-8"
                style={{ color: 'var(--text-muted)' }}
              >
                Pergunte sobre qualquer documento do seu setor
              </motion.p>
            )}
          </AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'text-white rounded-br-md'
                  : 'rounded-bl-md'
              }`}
                style={{
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, var(--clinical-600), var(--clinical-500))'
                    : 'var(--glass-clear)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-bl-md"
                style={{ background: 'var(--glass-clear)' }}>
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ color: 'var(--text-muted)' }}
                >
                  ...
                </motion.span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 shrink-0"
          style={{ borderTop: '1px solid var(--glass-border-strong)' }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Pergunte algo..."
              className="glass-input flex-1 px-4 py-2.5 text-sm"
              disabled={loading}
            />
            <button type="submit" disabled={loading}
              className="btn-primary !px-3 !py-2.5">
              Enviar
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
