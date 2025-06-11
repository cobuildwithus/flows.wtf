"use client"

import { AuthButton } from "@/components/ui/auth-button"
import { useAllocate } from "@/lib/allocation/allocation-context"

export const AllocationToggle = () => {
  const { isLoading, isActive, activate, allocator, votingToken, canAllocate } = useAllocate()

  if (!canAllocate) return null

  return (
    <AuthButton
      onClick={activate}
      disabled={isLoading || isActive}
      loading={isLoading}
      type="button"
    >
      {getButtonText(isActive, allocator, votingToken)}
    </AuthButton>
  )
}

function getButtonText(isActive: boolean, allocator: string | null, votingToken: string | null) {
  if (isActive) return "In progress..."
  if (allocator) return "Split funds"
  if (votingToken) return "Vote"
  return "Allocate"
}
