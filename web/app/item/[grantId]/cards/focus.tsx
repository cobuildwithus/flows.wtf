import { Gradient, GradientCard } from "./gradient-card"

interface Props {
  gradient: Gradient
  text: string
}

export function FocusCard(props: Props) {
  const { gradient, text } = props

  return (
    <GradientCard gradient={gradient} className="p-5 lg:h-2/5">
      <div className="flex h-full flex-col justify-between">
        <div className="text-[11px] uppercase tracking-wider opacity-60">Current Focus</div>
        <p className="mt-8 text-pretty text-sm leading-normal lg:mt-4">{text}</p>
      </div>
    </GradientCard>
  )
}
