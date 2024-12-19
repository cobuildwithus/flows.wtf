interface Props {
  timeline: Array<{ date: string; title: string }>
}

export function Timeline(props: Props) {
  const { timeline } = props

  return (
    <div className="h-full rounded-xl border bg-white/50 p-5 dark:bg-transparent">
      <h3 className="font-medium">Timeline</h3>

      <div className="relative space-y-6">
        <div className="absolute bottom-8 left-[5px] top-2.5 w-px bg-border" />
        {timeline.map(({ date, title }) => (
          <div key={`${date}-${title}`} className="relative pl-5">
            <div className="absolute left-0 top-[3px] size-2.5 rounded-full bg-primary"></div>
            <div className="text-xs text-muted-foreground">{date}</div>
            <p className="mt-2 text-sm font-medium">{title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
