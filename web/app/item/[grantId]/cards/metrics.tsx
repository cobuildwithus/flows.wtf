interface Props {
  metrics: Array<{
    value: number | string
    label: string
  }>
}

export function Metrics(props: Props) {
  const { metrics } = props

  return (
    <div className="col-span-full grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map(({ label, value }) => (
        <div key={label} className="rounded-xl border bg-card p-5">
          <div className="text-4xl font-bold lg:text-5xl">{value}</div>
          <div className="mt-2 text-sm text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  )
}
