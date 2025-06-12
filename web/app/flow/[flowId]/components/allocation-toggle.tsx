"use client"

import { AuthButton } from "@/components/ui/auth-button"
import { useAllocate } from "@/lib/allocation/allocation-context"

export const AllocationToggle = () => {
  const { isLoading, isActive, activate, canAllocate } = useAllocate()

  if (!canAllocate) return null

  return (
    <AuthButton
      onClick={activate}
      disabled={isLoading || isActive}
      loading={isLoading}
      type="button"
    >
      {getButtonText(isActive)}
    </AuthButton>
  )
}

function getButtonText(isActive: boolean) {
  if (isActive) return "In progress..."
  return "Allocate"
}
