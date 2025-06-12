"use client"

import { Button } from "@/components/ui/button"
import { useAllocate } from "@/lib/allocation/allocation-context"
import Link from "next/link"
import { AllocationToggle } from "./allocation-toggle"

export function CTAButtons() {
  const { isActive, canAllocate } = useAllocate()

  return (
    <div className="flex items-center space-x-4">
      {!isActive && (
        <Button className="rounded-xl" variant={canAllocate ? "outline" : "default"}>
          <Link href={`/apply`}>Apply</Link>
        </Button>
      )}
      <AllocationToggle />
    </div>
  )
}
