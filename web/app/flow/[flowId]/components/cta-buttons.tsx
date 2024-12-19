"use client"

import { Button } from "@/components/ui/button"
import { useVotingPower } from "@/lib/voting/use-voting-power"
import { useVoting } from "@/lib/voting/voting-context"
import Link from "next/link"
import { useAccount } from "wagmi"
import { VotingToggle } from "./voting-toggle"

export function CTAButtons() {
  const { isConnected } = useAccount()
  const { votingPower } = useVotingPower()
  const { isActive } = useVoting()

  const showVotingToggle = isConnected && votingPower > 0

  return (
    <div className="flex items-center space-x-4">
      {!isActive && (
        <Button variant={showVotingToggle ? "outline" : "default"}>
          <Link href={`/apply`}>
            Apply <span className="max-sm:hidden">for grant</span>
          </Link>
        </Button>
      )}
      {showVotingToggle && <VotingToggle />}
    </div>
  )
}
