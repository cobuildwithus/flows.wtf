import { type Gradient, GradientCard } from "./gradient-card"
import { PersonStanding } from "lucide-react"

type Beneficiary = {
  description: string
  id: string
}

interface Props {
  gradient: Gradient
  beneficiaries: Beneficiary[]
}

export function BeneficiariesCard(props: Props) {
  const { gradient, beneficiaries } = props

  return (
    <GradientCard
      gradient={gradient}
      className="overflow-hidden overflow-y-auto p-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-foreground/25 lg:h-2/5"
    >
      <div className="flex flex-col items-start">
        <div className="items-top flex w-full justify-between gap-2">
          <PersonStanding className="size-6" />
          <div className="text-[11px] uppercase tracking-wider opacity-60">Beneficiaries</div>
        </div>
        <ul className="mt-8 list-inside space-y-0.5 text-sm leading-normal md:space-y-2.5 lg:mt-4">
          {beneficiaries.map((beneficiary) => (
            <li key={beneficiary.id}>{beneficiary.description}</li>
          ))}
        </ul>
      </div>
    </GradientCard>
  )
}
