"use client"

import { Button } from "@/components/ui/button"
import { useLogin } from "@/lib/auth/use-login"
import { useDelegatedTokens } from "@/lib/voting/delegated-tokens/use-delegated-tokens"
import { useVoting } from "@/lib/voting/voting-context"
import { toast } from "sonner"
import { useAccount } from "wagmi"

export const VotingToggle = () => {
  const { isLoading, isActive, activate } = useVoting()
  const { address } = useAccount()
  const { login } = useLogin()
  const { tokens } = useDelegatedTokens(address)

  return (
    <Button
      onClick={() => {
        if (!address) {
          login()
          return
        }

        if (tokens.length === 0) {
          return toast.error("You don't have any Nouns delegated to vote with")
        }

        activate()
      }}
      disabled={isLoading || isActive}
      loading={isLoading}
      type="button"
    >
      {isActive ? "In progress..." : `Vote`}
    </Button>
  )
}
