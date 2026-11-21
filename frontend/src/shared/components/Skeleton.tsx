export function Skeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="fs-panel overflow-hidden">
          <div className="shimmer h-48" />
          <div className="space-y-3 p-5">
            <div className="shimmer h-3 w-1/4 rounded-full" />
            <div className="shimmer h-5 w-2/3 rounded-full" />
            <div className="shimmer h-3 w-full rounded-full" />
            <div className="flex items-center justify-between pt-2">
              <div className="shimmer h-7 w-24 rounded-full" />
              <div className="shimmer h-10 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
