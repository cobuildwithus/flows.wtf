"use client"

import { AuthButton } from "@/components/ui/auth-button"
import { useDelegatedTokens } from "@/lib/allocation/delegated-tokens/use-delegated-tokens"
import { useAllocate } from "@/lib/allocation/allocation-context"
import { toast } from "sonner"
import { useAccount } from "wagmi"

export const AllocationToggle = () => {
  const { isLoading, isActive, activate, allocator, votingToken } = useAllocate()
  const { address } = useAccount()
  const { tokens } = useDelegatedTokens(address)

  return (
    <AuthButton
      onClick={() => {
        if (tokens.length === 0 && !allocator) {
          return toast.error("You don't have any voting power.")
        }

        activate()
      }}
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
