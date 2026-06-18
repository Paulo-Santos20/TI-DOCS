interface Props {
  label: string
  value: number | string
  color?: string
}

export default function StatCard({ label, value, color = 'text-slate-800' }: Props) {
  return (
    <div className="card">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
