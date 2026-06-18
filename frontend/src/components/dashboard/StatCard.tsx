interface StatCardProps {
  title: string
  value: string | number
  icon: string
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
    </div>
  )
}
