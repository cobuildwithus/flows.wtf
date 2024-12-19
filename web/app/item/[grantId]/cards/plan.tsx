interface Props {
  plan: Array<{ title: string; description: string }>
  className?: string
}

export function Plan(props: Props) {
  const { plan, className = "" } = props

  return (
    <div className={className}>
      <h3 className="text-xl font-medium lg:text-2xl">The plan</h3>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {plan.map(({ title, description }) => (
          <div key={title} className="rounded-xl border bg-white/50 p-5 text-base dark:bg-black/5">
            <h3 className="font-bold text-foreground">{title}</h3>
            <p className="mt-2.5 leading-relaxed text-muted-foreground max-sm:text-sm">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
