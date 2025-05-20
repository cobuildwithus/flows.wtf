"use client"

import { AuthButton } from "@/components/ui/auth-button"
import { useDelegatedTokens } from "@/lib/voting/delegated-tokens/use-delegated-tokens"
import { useAllocateFlow } from "@/lib/voting/allocation-context"
import { toast } from "sonner"
import { useAccount } from "wagmi"

export const AllocationToggle = () => {
  const { isLoading, isActive, activate } = useAllocateFlow()
  const { address } = useAccount()
  const { tokens } = useDelegatedTokens(address)

  return (
    <AuthButton
      onClick={() => {
        if (tokens.length === 0) {
          return toast.error("You don't have any voting power.")
        }

        activate()
      }}
      disabled={isLoading || isActive}
      loading={isLoading}
      type="button"
    >
      {isActive ? "In progress..." : `Vote`}
    </AuthButton>
  )
}
