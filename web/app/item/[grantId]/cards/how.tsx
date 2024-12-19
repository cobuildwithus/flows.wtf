import { Icon } from "@/components/ui/icon"
import { Gradient, GradientCard } from "./gradient-card"

interface Props {
  gradient: Gradient
  icon: string
  text: string
}

export function HowCard(props: Props) {
  const { gradient, icon, text } = props

  return (
    <GradientCard gradient={gradient} className="p-5 lg:h-3/5">
      <div className="flex flex-col items-start justify-between lg:h-full">
        <Icon name={icon} className="size-6" />
        <p className="mt-8 text-pretty text-sm leading-normal">{text}</p>
      </div>
    </GradientCard>
  )
}
