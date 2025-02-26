import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Gradient, GradientCard } from "./gradient-card"

interface Props {
  deliverables: string[]
  gradient: Gradient
}

export function DeliverablesCard(props: Props) {
  const { deliverables, gradient } = props

  return (
    <GradientCard gradient={gradient} className="h-full p-5">
      <div className="flex h-full flex-col justify-start">
        <div className="text-[11px] uppercase tracking-wider opacity-60">Deliverables</div>
        <ul className="mt-8 space-y-0.5 text-sm leading-normal md:space-y-5 lg:mt-4">
          {deliverables.map((item) => {
            const match = item.match(/^(.*?)(\(.*?\))\.?$/)
            if (match) {
              const [_, mainText, tooltipText] = match
              return (
                <li key={item}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{mainText}</span>
                    </TooltipTrigger>
                    <TooltipContent>{tooltipText}</TooltipContent>
                  </Tooltip>
                </li>
              )
            }
            return <li key={item}>{item}</li>
          })}
        </ul>
      </div>
    </GradientCard>
  )
}
