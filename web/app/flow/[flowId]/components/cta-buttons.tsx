"use client"

import { Button } from "@/components/ui/button"
import { useAllocationPower } from "@/lib/allocation/hooks/use-allocation-power"
import { useAllocate } from "@/lib/allocation/allocation-context"
import Link from "next/link"
import { useAccount } from "wagmi"
import { AllocationToggle } from "./allocation-toggle"

export function CTAButtons() {
  const { isConnected } = useAccount()
  const { allocationPower } = useAllocationPower()
  const { isActive } = useAllocate()

  const showAllocationToggle = isConnected && allocationPower > 0

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
