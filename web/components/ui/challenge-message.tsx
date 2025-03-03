import { cn } from "@/lib/utils"

export function ChallengeMessage({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20",
        className,
      )}
    >
      <p className="text-sm text-yellow-800 dark:text-yellow-200">
        Remember: Anyone can challenge a grant, even if misinformed, so please don&apos;t take
        challenges personally. We value you as a builder, and are constantly working to improve the
        process.
      </p>
    </div>
  )
}
