"use client"

import { AuthButton } from "@/components/ui/auth-button"
import { ButtonProps } from "@/components/ui/button"
import { useAllocate } from "@/lib/allocation/allocation-context"
import { Edit } from "lucide-react"

export const AllocationToggle = ({ variant = "default" }: { variant?: ButtonProps["variant"] }) => {
  const { isLoading, isActive, activate, canAllocate } = useAllocate()

  if (!canAllocate) return null

  return (
    <AuthButton
      onClick={activate}
      disabled={isLoading || isActive}
      loading={isLoading}
      type="button"
      variant={variant}
    >
      {getButtonText(isActive)}
    </AuthButton>
  )
}

function getButtonText(isActive: boolean) {
  if (isActive) return "In progress..."
  return <Edit className="size-4" />
}
