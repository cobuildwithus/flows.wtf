import { Compass } from "lucide-react"
import { Gradient, GradientCard } from "./gradient-card"

interface Props {
  gradient: Gradient
  text: string
}

export function MissionCard(props: Props) {
  const { gradient, text } = props

  return (
    <GradientCard gradient={gradient} className="p-5 lg:h-3/5">
      <div className="flex flex-col items-start justify-between lg:h-full">
        <div className="items-top flex w-full justify-between gap-2">
          <Compass className="size-6" />
          <div className="text-[11px] uppercase tracking-wider opacity-60">Core Mission</div>
        </div>
        <ul className="mt-8 list-inside list-disc text-sm leading-normal">{text}</ul>
      </div>
    </GradientCard>
  )
}
