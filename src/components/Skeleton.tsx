/** Skeleton placeholder for a kajian card while data is loading. */
export function KajianCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square w-full" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="flex justify-between pt-2">
          <div className="skeleton h-3 w-12 rounded" />
          <div className="skeleton h-4 w-4 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function KajianGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <KajianCardSkeleton key={i} />
      ))}
    </div>
  );
}
