import { Dispute } from "@prisma/flows"

interface Props {
  dispute: Dispute
  className?: string
  mirrored?: boolean
}

export const VotesTicker = (props: Props) => {
  const { dispute, className = "", mirrored = false } = props

  const greenVotes = Number(mirrored ? dispute.challengerPartyVotes : dispute.requesterPartyVotes)
  const redVotes = Number(mirrored ? dispute.requesterPartyVotes : dispute.challengerPartyVotes)
  const totalVotes = Number(dispute.votes)
  const revealedVotes = greenVotes + redVotes
  const notRevealedVotes = totalVotes - revealedVotes
  const greenPercentage = (greenVotes / totalVotes) * 100
  const notRevealedPercentage = ((totalVotes - revealedVotes) / totalVotes) * 100

  return (
    <div className={className}>
      <div className="flex h-6 items-center space-x-1">
        {Array.from({ length: 50 }).map((_, index) => {
          const position = (index / 50) * 100

          let color = "bg-muted"
          if (position < greenPercentage) {
            color = "bg-green-500"
          } else if (position < greenPercentage + notRevealedPercentage) {
            color = "bg-muted-foreground"
          } else {
            color = "bg-red-500"
          }

          return <div key={index} className={`h-full grow rounded ${color}`} />
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-xs">
        <span className="text-green-500">{greenVotes || "0"}</span>
        <span className="text-muted-foreground">{notRevealedVotes} not revealed</span>
        <span className="text-red-500">{redVotes || "0"}</span>
      </div>
    </div>
  )
}
