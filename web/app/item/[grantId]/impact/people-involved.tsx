import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Impact } from "@prisma/flows"
import Image from "next/image"

interface Props {
  peopleInvolved: Impact["peopleInvolved"]
}

export function PeopleSection(props: Props) {
  const { peopleInvolved } = props

  if (peopleInvolved.length === 0) return null

  return (
    <div>
      <h3 className="flex items-center text-xs font-medium uppercase tracking-wide opacity-85">
        People{" "}
        <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1">
          {peopleInvolved.length}
        </span>
      </h3>
      <div className="mt-4 grid grid-cols-8 gap-2.5">
        {peopleInvolved.map((person) => (
          <Tooltip key={`${person.userId}`}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex size-full items-center space-x-2.5 overflow-hidden rounded-full text-sm",
                  {
                    "border-2 border-primary": person.beneficiary.isBeneficiary,
                  },
                )}
              >
                <Image
                  src={person.headshotUrl}
                  alt="Person"
                  width={108}
                  height={108}
                  className="size-full scale-[1.2] rounded-full"
                />
              </div>
            </TooltipTrigger>
            {person.beneficiary.isBeneficiary && (
              <TooltipContent className="max-w-xs py-2">{person.beneficiary.reason}</TooltipContent>
            )}
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
