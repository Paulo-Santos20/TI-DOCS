export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative w-10 h-10">
        <div
          className="absolute inset-0 rounded-full animate-glass-spin"
          style={{
            border: '2px solid transparent',
            borderTopColor: 'var(--clinical-500)',
            borderRightColor: 'var(--health-500)',
            borderRadius: '50%',
          }}
        />
        <div
          className="absolute inset-1 rounded-full"
          style={{ background: 'var(--glass-regular)', backdropFilter: 'blur(4px)' }}
        />
      </div>
    </div>
  )
}
