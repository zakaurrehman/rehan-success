export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="skeleton h-8 w-56 mb-2" />
      <div className="skeleton h-4 w-64 mb-6" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
      </div>
    </div>
  )
}
