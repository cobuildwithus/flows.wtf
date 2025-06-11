"use client"

import { Button } from "@/components/ui/button"
import { useVotingPower } from "@/lib/voting/hooks/use-voting-power"
import { useAllocate } from "@/lib/voting/allocation-context"
import Link from "next/link"
import { useAccount } from "wagmi"
import { AllocationToggle } from "./allocation-toggle"

export function CTAButtons() {
  const { isConnected } = useAccount()
  const { votingPower } = useVotingPower()
  const { isActive } = useAllocate()

  const showAllocationToggle = isConnected && votingPower > 0

  return (
    <div className="flex items-center space-x-4">
      {!isActive && (
        <Button className="rounded-xl" variant={showAllocationToggle ? "outline" : "default"}>
          <Link href={`/apply`}>Apply</Link>
        </Button>
      )}
      {showAllocationToggle && <AllocationToggle />}
    </div>
  )
}
