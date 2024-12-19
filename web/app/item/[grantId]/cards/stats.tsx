import { AnimatedSalary } from "@/components/global/animated-salary"
import { Currency } from "@/components/ui/currency"
import { Grant } from "@prisma/flows"
import { PropsWithChildren } from "react"
import { UserVotes } from "../components/user-votes"

interface Props {
  grant: Pick<
    Grant,
    "monthlyIncomingFlowRate" | "totalEarned" | "votesCount" | "id" | "parentContract"
  >
}

export const Stats = (props: Props) => {
  const { grant } = props

  return (
    <div className="grid grid-cols-2 gap-6 rounded-xl border bg-white/50 p-5 dark:bg-transparent">
      <Stat label="Budget">
        <Currency>{grant.monthlyIncomingFlowRate}</Currency>/mo
      </Stat>
      <Stat label="Total Earned">
        <AnimatedSalary value={grant.totalEarned} monthlyRate={grant.monthlyIncomingFlowRate} />
      </Stat>
      <Stat label="Community Votes">{grant.votesCount}</Stat>
      <Stat label="Your Vote">
        <UserVotes recipientId={grant.id} contract={grant.parentContract as `0x${string}`} />
      </Stat>
    </div>
  )
}

const Stat = (props: PropsWithChildren<{ label: string }>) => {
  const { children, label } = props
  return (
    <div>
      <div className="text-2xl font-bold leading-[46px] lg:text-3xl">{children}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
