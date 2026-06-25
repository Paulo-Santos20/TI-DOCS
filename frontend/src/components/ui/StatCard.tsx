import { motion } from 'framer-motion'

interface Props {
  label: string
  value: number | string
  color?: string
  index?: number
}

export default function StatCard({ label, value, color, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      className="card hover:scale-[1.02] cursor-default"
    >
      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <p className="mt-2 text-3xl font-bold" style={{ color: color ? `var(--${color})` : 'var(--text-primary)' }}>{value}</p>
    </motion.div>
  )
}
