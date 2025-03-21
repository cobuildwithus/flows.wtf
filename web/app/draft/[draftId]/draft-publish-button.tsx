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
import { meetsMinimumSalary, userBelowMaxGrants } from "@/lib/database/helpers"
import { RecipientType } from "@/lib/enums"
import { useTcrData } from "@/lib/tcr/use-tcr-data"
import { useTcrToken } from "@/lib/tcr/use-tcr-token"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import type { DerivedData, Draft, Grant } from "@prisma/flows"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { encodeAbiParameters, zeroAddress } from "viem"
import { base } from "viem/chains"
import { useAccount } from "wagmi"
import { BuyApplicationFee } from "./buy-application-fee"
import { publishDraft } from "./publish-draft"
import { AuthButton } from "@/components/ui/auth-button"
import type { User } from "@/lib/auth/user"
import SignInWithNeynar from "@/components/global/signin-with-neynar"

interface Props {
  draft: Draft
  flow: Grant & { derivedData: DerivedData | null }
  size?: "default" | "sm"
  grantsCount: number
  user?: User
}

const chainId = base.id

export function DraftPublishButton(props: Props) {
  const { draft, flow, size = "default", grantsCount, user } = props
  const { address } = useAccount()
  const router = useRouter()
  const ref = useRef<HTMLButtonElement>(null)

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

  if (!hasFarcasterAccount(user)) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" ref={ref} size={size}>
            {action}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Farcaster required</AlertDialogTitle>
            <AlertDialogDescription className="pt-1.5 leading-relaxed">
              Connect your Farcaster account to your wallet to {action.toLowerCase()} this{" "}
              {draft.isFlow ? "flow" : "grant"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {user && <SignInWithNeynar variant="secondary" user={user} />}
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  if (!userBelowMaxGrants(grantsCount)) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" ref={ref} size={size}>
            {action}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Maximum grants limit</AlertDialogTitle>
            <AlertDialogDescription className="pt-1.5 leading-relaxed">
              This builder has reached the maximum number of active grants allowed per user. Please
              focus on your existing grants!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Okay</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

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
        <AuthButton ref={ref} size={size}>
          {action}
        </AuthButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-sm">
        <DialogHeader>
          <DialogTitle className="px-4 text-center text-lg font-medium">
            {action}: {draft.title}
          </DialogTitle>
        </DialogHeader>
        <ul className="my-4 space-y-6">
          <li className="flex items-start space-x-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              1
            </span>
            <p className="text-muted-foreground">
              Deposit{" "}
              <TcrInUsd tokenEmitter={getEthAddress(flow.tokenEmitter)} amount={addItemCost} />.
            </p>
          </li>
          <li className="flex items-start space-x-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              2
            </span>
            <p className="text-muted-foreground">
              For {challengePeriodFormatted}, anyone can challenge your application. You may lose
              your deposit if your application does not meet the requirements.
            </p>
          </li>
          <li className="flex items-start space-x-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              3
            </span>
            <div>
              <p className="text-muted-foreground">If approved, your deposit will be refunded.</p>
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
              {!hasEnoughAllowance && "Approve Deposit"}
              {hasEnoughAllowance && `${action} draft`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function hasFarcasterAccount(user?: User) {
  return user?.fid !== undefined
}
