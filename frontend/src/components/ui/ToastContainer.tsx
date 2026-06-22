import { useToast } from '../../contexts/ToastContext'

const typeStyles: Record<string, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-700',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const typeIcons: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in max-w-sm ${typeStyles[toast.type]}`}
        >
          <span className="font-bold text-lg leading-none mt-0.5 shrink-0">
            {typeIcons[toast.type]}
          </span>
          <p className="text-sm leading-snug flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-current opacity-50 hover:opacity-100 transition-opacity shrink-0 leading-none text-lg"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
