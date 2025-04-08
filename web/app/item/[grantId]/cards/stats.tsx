import { cn } from "@/lib/utils"
import { PropsWithChildren } from "react"

export const Stat = (props: PropsWithChildren<{ label: string; className?: string }>) => {
  const { children, label, className } = props
  return (
    <div
      className={cn(
        "col-span-6 flex h-full flex-col justify-around rounded-xl border px-4 py-4 md:px-5 xl:col-span-3",
        className,
      )}
    >
      <div className="flex h-[46px] items-center text-2xl font-bold lg:text-3xl">{children}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
