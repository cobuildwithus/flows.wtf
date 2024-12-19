"use client"

import { canBeChallenged } from "@/app/components/dispute/helpers"
import { SwapTokenButton } from "@/app/token/swap-token-button"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Markdown } from "@/components/ui/markdown"
import { Textarea } from "@/components/ui/textarea"
import { erc20VotesArbitratorImplAbi, flowTcrImplAbi } from "@/lib/abis"
import { useTcrData } from "@/lib/tcr/use-tcr-data"
import { useTcrToken } from "@/lib/tcr/use-tcr-token"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Grant } from "@prisma/flows"
import { useRouter } from "next/navigation"
import { PropsWithChildren, useRef, useState } from "react"
import { toast } from "sonner"
import { Address, formatEther } from "viem"
import { base } from "viem/chains"

interface Props {
  grant: Grant
  flow: Grant
  className?: string
}

export function DisputeStartButton(props: Props) {
  const { grant, flow, className } = props
  const router = useRouter()
  const [reason, setReason] = useState("")
  const ref = useRef<HTMLButtonElement>(null)

  const { challengeSubmissionCost, addItemCost, arbitrationCost } = useTcrData(
    getEthAddress(flow.tcr),
  )
  const token = useTcrToken(getEthAddress(flow.erc20), getEthAddress(flow.tcr))

  const { writeContract, prepareWallet, isLoading, toastId } = useContractTransaction({
    loading: "Challenging...",
    success: "Challenged!",
    onSuccess: async () => {
      ref.current?.click() // close dialog
      setTimeout(() => {
        router.refresh()
      }, 1000)
    },
  })

  const hasEnoughBalance = token.balance >= challengeSubmissionCost
  const hasEnoughAllowance = token.allowance >= challengeSubmissionCost

  const type = grant.isActive ? "removal request" : "application"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" ref={ref} disabled={!canBeChallenged(grant)} className={className}>
          Challenge {type}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium capitalize">
            Challenge {type}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="md:pr-6">
            <h2 className="font-medium tracking-tight">{flow.title}</h2>
            <h3 className="text-sm text-muted-foreground">Guidelines & requirements</h3>
            <div className="mt-6 space-y-2.5 text-sm leading-normal">
              <Markdown>{flow.description}</Markdown>
            </div>
          </div>
          <ul className="my-4 space-y-6 text-sm md:pl-6">
            <Step i={1}>
              <p>
                Challenging this {type} ({grant.title}) costs {formatEther(challengeSubmissionCost)}{" "}
                {token.symbol} and will kick off a voting period.
              </p>
            </Step>
            <Step i={2}>
              <p className="mb-2">Why are you challenging this {type}?</p>
              <Textarea
                className="mt-4"
                placeholder="Explain your reasoning..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </Step>
            <Step i={3}>
              <p>
                &quot;{token.name}&quot; ({token.symbol}) holders anonymously vote on whether the{" "}
                {type} should be accepted or not.
              </p>
            </Step>
            <Step i={4}>
              <p className="text-sm">
                You lose your payment if your challenge is rejected by {token.name} voters. If the
                challenge is successful, you are paid the applicant&apos;s bond of{" "}
                {formatEther(addItemCost - arbitrationCost)} {token.symbol} and are repaid your
                challenge fee.
              </p>
              <p className="mt-4 text-sm">
                Your {token.symbol} balance: {formatEther(token.balance)} (
                {formatEther(token.allowance)} approved)
              </p>
            </Step>
          </ul>
        </div>
        <div className="flex justify-end space-x-2">
          {!hasEnoughBalance && (
            <SwapTokenButton
              text={`Buy ${token.symbol} to challenge`}
              extraInfo="challenge"
              flow={flow}
              defaultTokenAmount={challengeSubmissionCost}
            />
          )}
          {hasEnoughBalance && (
            <Button
              disabled={token.isApproving || isLoading}
              loading={token.isApproving || isLoading}
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

                  writeContract({
                    address: getEthAddress(flow.tcr),
                    abi: [...flowTcrImplAbi, ...erc20VotesArbitratorImplAbi],
                    functionName: "challengeRequest",
                    args: [grant.id as Address, reason],
                    chainId: base.id,
                  })
                } catch (e: any) {
                  toast.error(e.message, { id: toastId })
                }
              }}
            >
              {!hasEnoughAllowance && "Approve and "} Challenge
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Step({ i, children }: PropsWithChildren<{ i: number }>) {
  return (
    <li className="flex items-start space-x-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
        {i}
      </span>
      <div>{children}</div>
    </li>
  )
}
