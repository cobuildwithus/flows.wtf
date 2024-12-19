export const SkeletonLoader = ({ count, height }: { count: number; height: number }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, index) => (
      <Skeleton key={index} height={height} width="100%" />
    ))}
  </div>
)
export const Skeleton = ({ height, width = "100%" }: { height: number; width: string }) => (
  <div
    style={{ width, height }}
    className="w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-600"
  />
)
