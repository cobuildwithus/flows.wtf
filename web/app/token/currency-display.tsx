import { cn } from "@/lib/utils"

export const CurrencyDisplay = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      "flex flex-shrink-0 items-center space-x-1 rounded-full bg-white px-2 py-1 text-lg font-medium shadow-sm dark:border dark:border-gray-700 dark:bg-black/30 dark:text-gray-50",
      className,
    )}
  >
    {children}
  </div>
)
