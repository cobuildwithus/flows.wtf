"use client"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { flowTcrImplAbi } from "@/lib/abis"
import { useLogin } from "@/lib/auth/use-login"
import { useTcrData } from "@/lib/tcr/use-tcr-data"
import { useTcrToken } from "@/lib/tcr/use-tcr-token"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Grant } from "@prisma/flows"
import { useRouter } from "next/navigation"
import { PropsWithChildren, useRef, useState } from "react"
import { toast } from "sonner"
import { formatEther } from "viem"
import { base } from "viem/chains"
import { useAccount } from "wagmi"

interface Props {
  grant: Grant
  flow: Grant
}

const chainId = base.id

const reasons = [
  {
    value: "inactive",
    label: (
      <>
        Inactive - <span className="text-xs text-muted-foreground">Flow without recent impact</span>
      </>
    ),
  },
  {
    value: "values-misalignment",
    label: (
      <>
        Not Nounish -{" "}
        <span className="text-xs text-muted-foreground">Does not align with Nounish values</span>
      </>
    ),
  },
  {
    value: "captured",
    label: (
      <>
        Captured -{" "}
        <span className="text-xs text-muted-foreground">
          Flow has been captured through collusion
        </span>
      </>
    ),
  },
  {
    value: "low-quality",
    label: (
      <>
        Low Quality -{" "}
        <span className="text-xs text-muted-foreground">Poor deliverables or outcomes</span>
      </>
    ),
  },
  {
    value: "other",
    label: (
      <>
        Other -{" "}
        <span className="text-xs text-muted-foreground">Please explain in the comments</span>
      </>
    ),
  },
] as const

export function GrantRemoveRequestButton(props: Props) {
  const { grant, flow } = props
  const { address } = useAccount()
  const router = useRouter()
  const [reason, setReason] = useState<string | null>(null)
  const [comment, setComment] = useState<string>("")
  const { login } = useLogin()

  const ref = useRef<HTMLButtonElement>(null)

  const { removeItemCost, challengePeriodFormatted } = useTcrData(getEthAddress(flow.tcr), chainId)
  const token = useTcrToken(getEthAddress(flow.erc20), getEthAddress(flow.tcr), chainId)

  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Requested removal!",
    loading: "Requesting removal...",
    onSuccess: async (hash) => {
      ref.current?.click() // close dialog
      await new Promise((resolve) => setTimeout(resolve, 2000))
      router.refresh()
    },
  })

  const hasEnoughBalance = token.balance >= removeItemCost
  const hasEnoughAllowance = token.allowance >= removeItemCost

  const type = grant.isFlow ? "flow" : "grant"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          ref={ref}
          className="w-full bg-transparent"
          variant="outline"
          onClick={(e) => {
            if (!address) {
              login()
              e.preventDefault()
            }
          }}
        >
          Start removal process
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">
            Remove &quot;{grant.title}&quot;
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="md:pr-6">
            <h2 className="font-medium tracking-tight">{flow.title}</h2>
            <h3 className="text-sm text-muted-foreground">Guidelines & requirements</h3>
            <div className="mt-6 max-h-[75vh] space-y-2.5 overflow-y-auto text-sm leading-normal scrollbar scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              <Markdown>{flow.description}</Markdown>
            </div>
          </div>
          <ul className="my-4 space-y-6 text-sm md:pl-6">
            <Step i={1}>
              <p>
                Requesting a removal is a significant action and should only be undertaken if the{" "}
                {type} fails to meet the specified requirements or is underperforming.
              </p>
            </Step>
            <Step i={2}>
              <div>
                <p className="mb-2">Please select a reason for the removal request:</p>
                <Select onValueChange={setReason}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  className="mt-4"
                  placeholder="Additional comments (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>
            </Step>
            <Step i={3}>
              <p>
                Requesting removal costs {formatEther(removeItemCost)} {token.symbol} and will kick
                off a challenge period.
              </p>
            </Step>
            <Step i={4}>
              <p>
                For {challengePeriodFormatted}, anyone can pay to challenge this request and send it
                to a community vote. You may lose your fee if the request is voted down by the
                community.
              </p>
            </Step>
            <Step i={5}>
              <div>
                <p>If not challenged, this {type} will be removed and your fee will be returned.</p>
                <p className="mt-2.5 text-sm text-muted-foreground">
                  Your {token.symbol} balance: {formatEther(token.balance)} (
                  {formatEther(token.allowance)} approved)
                </p>
              </div>
            </Step>
          </ul>
        </div>
        <div className="flex justify-end space-x-2">
          {!hasEnoughBalance && (
            <SwapTokenButton
              text={`Buy ${token.symbol} to request`}
              onSuccess={() => {
                token.refetch()
              }}
              extraInfo="apply"
              flow={flow}
              defaultTokenAmount={removeItemCost - token.balance}
            />
          )}
          {hasEnoughBalance && (
            <Button
              disabled={token.isApproving || isLoading}
              loading={token.isApproving || isLoading}
              type="button"
              onClick={async () => {
                if (!reason) {
                  toast.error("Please select a reason for removal.", { id: toastId })
                  return
                }

                if (!hasEnoughAllowance) {
                  return token.approve(removeItemCost)
                }

                try {
                  await prepareWallet()

                  writeContract({
                    account: address,
                    abi: flowTcrImplAbi,
                    functionName: "removeItem",
                    address: getEthAddress(flow.tcr),
                    chainId,
                    args: [grant.id as `0x${string}`, reason + (comment ? ` || ${comment}` : "")],
                  })
                } catch (e: any) {
                  toast.error(e.message, { id: toastId })
                }
              }}
            >
              {!hasEnoughAllowance && "Approve and "} Request Removal
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
