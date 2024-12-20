"use client"

import { TcrInUsd } from "@/components/global/tcr-in-usd"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { flowTcrImplAbi } from "@/lib/abis"
import { useLogin } from "@/lib/auth/use-login"
import { meetsMinimumSalary } from "@/lib/database/helpers"
import { RecipientType } from "@/lib/enums"
import { useTcrData } from "@/lib/tcr/use-tcr-data"
import { useTcrToken } from "@/lib/tcr/use-tcr-token"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { DerivedData, Draft, Grant } from "@prisma/flows"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { encodeAbiParameters, zeroAddress } from "viem"
import { base } from "viem/chains"
import { useAccount } from "wagmi"
import { BuyApplicationFee } from "./buy-application-fee"
import { publishDraft } from "./publish-draft"

interface Props {
  draft: Draft
  flow: Grant & { derivedData: DerivedData | null }
  size?: "default" | "sm"
}

const chainId = base.id

export function DraftPublishButton(props: Props) {
  const { draft, flow, size = "default" } = props
  const { address } = useAccount()
  const router = useRouter()
  const ref = useRef<HTMLButtonElement>(null)
  const { login } = useLogin()

  const { addItemCost, challengePeriodFormatted } = useTcrData(getEthAddress(flow.tcr))
  const token = useTcrToken(getEthAddress(flow.erc20), getEthAddress(flow.tcr))

  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Draft published!",
    onSuccess: async (hash) => {
      await publishDraft(draft.id, hash)
      ref.current?.click() // close dialog
      // wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push(`/flow/${flow.id}/applications`)
    },
  })

  const isOwner = draft.users.some((user) => user.toLowerCase() === address?.toLowerCase())
  const [action, setAction] = useState("Publish")

  useEffect(() => {
    setAction(isOwner ? "Publish" : "Sponsor")
  }, [isOwner])

  const hasEnoughBalance = token.balance >= addItemCost
  const hasEnoughAllowance = token.allowance >= addItemCost

  if (!meetsMinimumSalary(flow)) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" ref={ref} size={size}>
            {action}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>This flow is not accepting new grants</AlertDialogTitle>
            <AlertDialogDescription className="pt-1.5 leading-relaxed">
              &quot;{flow.title}&quot; cannot accept any more grants at this time. Please try again
              later when spots open up.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Okay</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          onClick={(e) => {
            if (!address) {
              e.preventDefault()
              login()
            }
          }}
          ref={ref}
          size={size}
        >
          {action}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">
            {action} &quot;{draft.title}&quot; {draft.isFlow ? "Flow" : "Grant"}
          </DialogTitle>
        </DialogHeader>
        <ul className="my-4 space-y-6">
          <li className="flex items-start space-x-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              1
            </span>
            <p className="text-muted-foreground">
              Applying costs{" "}
              <TcrInUsd tokenEmitter={getEthAddress(flow.tokenEmitter)} amount={addItemCost} /> and
              will kick off a challenge period.
            </p>
          </li>
          <li className="flex items-start space-x-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              2
            </span>
            <p className="text-muted-foreground">
              For {challengePeriodFormatted}, anyone can pay to challenge this application and send
              it to a community vote. You may lose your application fee if the application is voted
              down by the community.
            </p>
          </li>
          <li className="flex items-start space-x-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              3
            </span>
            <div>
              <p className="text-muted-foreground">
                If not challenged, your application will be accepted and your application fee will
                be returned.
              </p>
            </div>
          </li>
        </ul>
        <div className="flex justify-end space-x-2">
          {!hasEnoughBalance && (
            <BuyApplicationFee
              flow={flow}
              amount={addItemCost - token.balance}
              onSuccess={() => {
                token.refetch()
              }}
            />
          )}
          {hasEnoughBalance && (
            <Button
              disabled={!hasEnoughBalance || token.isApproving || isLoading}
              loading={token.isApproving || isLoading}
              type="button"
              onClick={async () => {
                if (!hasEnoughAllowance) {
                  return token.approve(addItemCost)
                }

                try {
                  await prepareWallet()

                  writeContract({
                    account: address,
                    abi: flowTcrImplAbi,
                    functionName: "addItem",
                    address: getEthAddress(flow.tcr),
                    chainId,
                    args: [
                      encodeAbiParameters(
                        [
                          { name: "recipient", type: "address" },
                          {
                            name: "metadata",
                            type: "tuple",
                            components: [
                              { name: "title", type: "string" },
                              { name: "description", type: "string" },
                              { name: "image", type: "string" },
                              { name: "tagline", type: "string" },
                              { name: "url", type: "string" },
                            ],
                          },
                          { name: "recipientType", type: "uint8" },
                        ],
                        [
                          draft.isFlow ? zeroAddress : getEthAddress(draft.users[0]),
                          {
                            title: draft.title,
                            description: draft.description,
                            image: draft.image,
                            tagline: draft.tagline || "",
                            url: "",
                          },
                          draft.isFlow ? RecipientType.FlowContract : RecipientType.ExternalAccount,
                        ],
                      ),
                    ],
                  })
                } catch (e: any) {
                  toast.error(e.message, { id: toastId })
                }
              }}
            >
              {!hasEnoughAllowance && "Approve Fee"}
              {hasEnoughAllowance && `${action} draft`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
