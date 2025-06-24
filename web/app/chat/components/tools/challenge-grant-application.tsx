"use client"

import { canBeChallenged } from "@/app/components/dispute/helpers"
import { getGrant } from "@/app/item/[grantId]/get-grant"
import { SwapTokenButton } from "@/app/token/swap-token-button"
import { Button } from "@/components/ui/button"
import { erc20VotesArbitratorImplAbi, flowTcrImplAbi } from "@/lib/abis"
import { useServerFunction } from "@/lib/hooks/use-server-function"
import { useTcrData } from "@/lib/tcr/use-tcr-data"
import { useTcrToken } from "@/lib/tcr/use-tcr-token"
import { explorerUrl, getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { useRouter } from "next/navigation"
import type { PropsWithChildren } from "react"
import { useState } from "react"
import { toast } from "sonner"
import { formatEther } from "viem"
import { useAccount } from "wagmi"
import { useAgentChat } from "../agent-chat"
import { Textarea } from "@/components/ui/textarea"

interface Props {
  grantId: string
  reason: string
  comment: string | null
}


export function ChallengeGrantApplication(props: Props) {
  const { grantId, reason: initialReason, comment } = props
  const [reason, setReason] = useState(comment || initialReason || "")
  const router = useRouter()

  const { data: grant } = useServerFunction(getGrant, "getGrant", [grantId])

  const tcrAddress = (grant?.flow.tcr ?? undefined) as `0x${string}` | undefined
  const erc20Address = (grant?.flow.erc20 ?? undefined) as `0x${string}` | undefined

  const { address } = useAccount()
  const { user, append } = useAgentChat()

  const chainId = grant?.flow.chainId ?? grant?.chainId ?? 0

  const { challengeSubmissionCost, addItemCost, arbitrationCost } = useTcrData(
    tcrAddress,
    chainId,
  )
  const token = useTcrToken(
    erc20Address as `0x${string}`,
    tcrAddress as `0x${string}`,
    chainId,
  )

  const hasEnoughBalance = token.balance >= challengeSubmissionCost
  const hasEnoughAllowance = token.allowance >= challengeSubmissionCost

  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Challenge submitted!",
    loading: "Challenging...",
    onSuccess: async (hash) => {
      append({
        role: "user",
        content: `I've just challenged this ${type} application. Here is the transaction: ${explorerUrl(hash, chainId, "tx")}`,
      })
      setTimeout(() => {
        router.refresh()
      }, 1000)
    },
  })

  const type = grant?.isFlow ? "flow" : "grant"
  const applicationStatus = grant?.isActive ? "removal request" : "application"

  const canChallenge = grant ? canBeChallenged(grant) : false

  return (
    <div className="w-full py-3">
      <div className="flex flex-col rounded-xl border-[3px] border-red-500 bg-background/50 p-5">
        <h5 className="text-left text-xs uppercase tracking-widest opacity-75">
          Challenge {applicationStatus}
        </h5>
        <p className="mt-6 font-medium">{grant?.title}</p>

        <ul className="mb-4 mt-6 space-y-5 border-t pt-6 text-sm">
          <Step i={1}>
            Challenging this {applicationStatus} costs {formatEther(challengeSubmissionCost)}{" "}
            {token.symbol} and will kick off a voting period.
            {token.balance > 0 && (
              <>
                <br />
                You have {Number(formatEther(token.balance)).toFixed(2)} {token.symbol} (
                {Number(formatEther(token.allowance)).toFixed(2)} approved)
              </>
            )}
          </Step>
          <Step i={2}>
            <p className="mb-2">
              Why are you challenging this {applicationStatus}? Please reference the requirements.
            </p>
            <Textarea
              className="mt-4"
              placeholder="Explain your reasoning..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
            />
          </Step>
          <Step i={3}>
            <p>
              &quot;{token.name}&quot; ({token.symbol}) holders anonymously vote on whether the{" "}
              {applicationStatus} should be accepted or not.
            </p>
          </Step>
          <Step i={4}>
            <p>
              You lose your payment if your challenge is rejected by {token.name} voters. If the
              challenge is successful, you are paid the applicant&apos;s bond of{" "}
              {formatEther(addItemCost - arbitrationCost)} {token.symbol} and are repaid your
              challenge fee.
            </p>
          </Step>
        </ul>

        {grant && user && (
          <div className="mt-6 flex justify-end">
            {!hasEnoughBalance && grant.flow.erc20 && (
              <SwapTokenButton
                text={`Buy ${token.symbol} to challenge`}
                extraInfo="challenge"
                flow={grant.flow}
                defaultTokenAmount={challengeSubmissionCost}
                onSuccess={() => {
                  token.refetch()
                }}
                erc20Address={getEthAddress(grant.flow.erc20 as `0x${string}`)}
              />
            )}
            {hasEnoughBalance && (
              <Button
                disabled={token.isApproving || isLoading || !canChallenge || !reason}
                loading={token.isApproving || isLoading}
                variant="destructive"
                type="button"
                onClick={async () => {
                  if (!reason) {
                    toast.error("Please provide a reason", { id: toastId })
                    return
                  }

                  if (!hasEnoughAllowance) {
                    return token.approve(challengeSubmissionCost)
                  }

                  try {
                    await prepareWallet()

                    if (!tcrAddress) {
                      toast.error("You cannot challenge a grant in this flow. No TCR found.", {
                        id: toastId,
                      })
                      return
                    }

                    writeContract({
                      account: address,
                      address: getEthAddress(tcrAddress),
                      abi: [...flowTcrImplAbi, ...erc20VotesArbitratorImplAbi],
                      functionName: "challengeRequest",
                      chainId,
                      args: [grant.id as `0x${string}`, reason],
                    })
                  } catch (e: unknown) {
                    toast.error((e as Error)?.message, { id: toastId })
                  }
                }}
              >
                {!hasEnoughAllowance && "Approve and "} Challenge
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Step({ i, children }: PropsWithChildren<{ i: number }>) {
  return (
    <li className="flex items-start space-x-4">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
        {i}
      </span>
      <div className="leading-normal">{children}</div>
    </li>
  )
}
