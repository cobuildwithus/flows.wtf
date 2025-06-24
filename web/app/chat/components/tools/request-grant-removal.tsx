"use client"

import { canRemovalBeRequested } from "@/app/components/dispute/helpers"
import { getGrant } from "@/app/item/[grantId]/get-grant"
import { SwapTokenButton } from "@/app/token/swap-token-button"
import SignInWithNeynar from "@/components/global/signin-with-neynar"
import { Button } from "@/components/ui/button"
import { flowTcrImplAbi } from "@/lib/abis"
import { useServerFunction } from "@/lib/hooks/use-server-function"
import { useTcrData } from "@/lib/tcr/use-tcr-data"
import { useTcrToken } from "@/lib/tcr/use-tcr-token"
import { explorerUrl, getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import { formatEther } from "viem"
import { useAccount } from "wagmi"
import { useAgentChat } from "../agent-chat"

interface Props {
  grantId: string
  reason: keyof typeof reasons
  comment: string | null
}


export function RequestGrantRemoval(props: Props) {
  const { grantId, reason, comment } = props

  const { data: grant } = useServerFunction(getGrant, "getGrant", [grantId])

  const { address } = useAccount()
  const { user, append } = useAgentChat()

  const chainId = grant?.flow.chainId ?? grant?.chainId ?? 0

  const { removeItemCost, challengePeriodFormatted } = useTcrData(
    grant?.flow.tcr as `0x${string}`,
    chainId,
  )
  const token = useTcrToken(
    grant?.flow.erc20 as `0x${string}`,
    grant?.flow.tcr as `0x${string}`,
    chainId,
  )

  const hasEnoughBalance = token.balance >= removeItemCost
  const hasEnoughAllowance = token.allowance >= removeItemCost

  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Requested removal!",
    loading: "Requesting removal...",
    onSuccess: async (hash) => {
      append({
        role: "user",
        content: `I've just requested removal of this ${type}. Here is the transaction: ${explorerUrl(hash, chainId, "tx")}`,
      })
    },
  })

  const type = grant?.isFlow ? "flow" : "grant"

  const [canRemove] = grant ? canRemovalBeRequested(grant) : [false]

  return (
    <div className="w-full py-3">
      <div className="flex flex-col rounded-xl border-[3px] border-red-500 bg-background/50 p-5">
        <h5 className="text-left text-xs uppercase tracking-widest opacity-75">Grant removal</h5>
        <p className="mt-6 font-medium">{reasons.find((r) => r.value === reason)?.label}</p>
        {comment && <p className="mt-2.5 text-sm leading-relaxed opacity-75">{comment}</p>}
        <ul className="mb-4 mt-6 space-y-5 border-t pt-6 text-xs">
          <Step i={1}>
            It costs {formatEther(removeItemCost)} {token.symbol} and will kick off a challenge
            period.
            <br /> You have {formatEther(token.balance)} {token.symbol} (
            {formatEther(token.allowance)} approved)
          </Step>
          <Step i={2}>
            For {challengePeriodFormatted}, anyone can pay to challenge this request and send it to
            a&nbsp;community vote. You may lose your fee if the request is voted down.
          </Step>
          <Step i={3}>
            If not challenged, this {type} will be removed and your fee will be returned.
          </Step>
        </ul>
        {grant && user && (
          <div className="mt-6 flex justify-end">
            {!user.hasSignerUUID && <SignInWithNeynar user={user} />}
            {user.hasSignerUUID && !hasEnoughBalance && (
              <SwapTokenButton
                text={`Buy ${token.symbol} to request`}
                onSuccess={() => {
                  token.refetch()
                }}
                flow={grant.flow}
                defaultTokenAmount={removeItemCost - token.balance}
                erc20Address={getEthAddress(grant.flow.erc20 as `0x${string}`)}
              />
            )}
            {user.hasSignerUUID && hasEnoughBalance && (
              <Button
                disabled={token.isApproving || isLoading || !canRemove}
                loading={token.isApproving || isLoading}
                variant="destructive"
                type="button"
                onClick={async () => {
                  if (!hasEnoughAllowance) {
                    return token.approve(removeItemCost)
                  }

                  try {
                    await prepareWallet()

                    if (!grant.flow.tcr) {
                      toast.error("You cannot request removal of this grant. No TCR found.", {
                        id: toastId,
                      })
                      return
                    }

                    writeContract({
                      account: address,
                      abi: flowTcrImplAbi,
                      functionName: "removeItem",
                      address: getEthAddress(grant.flow.tcr),
                      chainId,
                      args: [
                        grant.id as `0x${string}`,
                        reason.toString() + (comment ? ` || ${comment}` : ""),
                      ],
                    })
                  } catch (e: unknown) {
                    toast.error((e as Error)?.message, { id: toastId })
                  }
                }}
              >
                {!hasEnoughAllowance && "Approve and "} Request Removal
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface RemovalReason {
  value: string
  label: string
  isFlowOnly?: boolean
  isGrantOnly?: boolean
}

const reasons: RemovalReason[] = [
  {
    value: "inactive",
    label: "Inactive - Flow without recent impact",
  },
  {
    value: "values-misalignment",
    label: "Not Nounish - Does not align with Nounish values",
  },
  {
    value: "captured",
    label: "Captured - Flow has been captured through collusion",
    isFlowOnly: true,
  },
  {
    value: "low-quality",
    label: "Requirements Not Met - Breaking requirements",
  },
  {
    value: "duplicate",
    label: "Duplicate - Project has > 1 grant in this flow.",
    isGrantOnly: true,
  },
  {
    value: "salary-threshold",
    label: "Too Many Grants - > 2 grants w/ funding > $50/month.",
    isGrantOnly: true,
  },
  {
    value: "double-dipping",
    label: "Double-Dipping - Already funded for the same work.",
    isGrantOnly: true,
  },
  {
    value: "other",
    label: "Other - Please explain in the comments",
  },
]

function Step({ i, children }: PropsWithChildren<{ i: number }>) {
  return (
    <li className="flex items-center space-x-4">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-white">
        {i}
      </span>
      <div className="leading-normal opacity-75">{children}</div>
    </li>
  )
}
