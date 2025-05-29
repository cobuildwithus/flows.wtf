import { cn } from "@/lib/utils"

export const SkeletonLoader = ({ count, height }: { count: number; height: number }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, index) => (
      <Skeleton key={index} height={height} width="100%" />
    ))}
  </div>
)
export const Skeleton = ({
  height,
  width = "100%",
  className,
}: {
  height: number
  width?: string
  className?: string
}) => (
  <div
    style={{ width, height }}
    className={cn("w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800", className)}
  />
)
