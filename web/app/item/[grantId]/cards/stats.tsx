import { PropsWithChildren } from "react"

export const Stat = (props: PropsWithChildren<{ label: string }>) => {
  const { children, label } = props
  return (
    <div className="rounded-xl border p-5 xl:col-span-3">
      <div className="flex h-[46px] items-center text-2xl font-bold lg:text-3xl">{children}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
