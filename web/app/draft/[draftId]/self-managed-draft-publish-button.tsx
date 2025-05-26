"use client"

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
import { flowTcrImplAbi, selfManagedFlowImplAbi } from "@/lib/abis"
import { RecipientType } from "@/lib/enums"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import type { DerivedData, Draft, Grant } from "@prisma/flows"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { toast } from "sonner"
import { encodeAbiParameters, keccak256, zeroAddress } from "viem"
import { base } from "viem/chains"
import { useAccount } from "wagmi"
import { publishDraft } from "./publish-draft"
import type { User } from "@/lib/auth/user"
import SignInWithNeynar from "@/components/global/signin-with-neynar"
import { AuthButton } from "@/components/ui/auth-button"

interface Props {
  draft: Draft
  flow: Grant & { derivedData: DerivedData | null }
  size?: "default" | "sm"
  user: User
}

const chainId = base.id

export function ManagedFlowDraftPublishButton(props: Props) {
  const { draft, flow, size = "default", user } = props
  const { address } = useAccount()
  const router = useRouter()
  const ref = useRef<HTMLButtonElement>(null)

  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Draft published!",
    onSuccess: async (hash) => {
      await publishDraft(draft.id, hash)
      ref.current?.click() // close dialog
      // wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push(`/flow/${flow.id}`)
    },
  })

  if (!hasFarcasterAccount(user)) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" ref={ref} size={size}>
            Add to flow
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Farcaster required</AlertDialogTitle>
            <AlertDialogDescription className="pt-1.5 leading-relaxed">
              Connect your Farcaster account to your wallet to add to a flow.
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <AuthButton ref={ref} size={size}>
          Add to flow
        </AuthButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-xs">
        <DialogHeader>
          <DialogTitle className="px-4 text-center text-xl font-medium">
            Add {draft.title} to {flow.title}
          </DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-sm text-muted-foreground">
            This is a self managed flow. You can add and remove applicants at any time, and set a
            custom flow rate for each applicant.
          </p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            disabled={isLoading}
            loading={isLoading}
            type="button"
            onClick={async () => {
              try {
                await prepareWallet()

                writeContract({
                  account: address,
                  abi: selfManagedFlowImplAbi,
                  functionName: "addRecipient",
                  address: getEthAddress(flow.recipient as `0x${string}`),
                  chainId,
                  args: [
                    keccak256(
                      encodeAbiParameters(
                        [
                          { name: "title", type: "string" },
                          { name: "description", type: "string" },
                          { name: "image", type: "string" },
                          { name: "tagline", type: "string" },
                          { name: "url", type: "string" },
                        ],
                        [draft.title, draft.description, draft.image, draft.tagline || "", ""],
                      ),
                    ),
                    getEthAddress(draft.users[0]),
                    {
                      title: draft.title,
                      description: draft.description,
                      image: draft.image,
                      tagline: draft.tagline || "",
                      url: "",
                    },
                  ],
                })
              } catch (e: any) {
                toast.error(e.message, { id: toastId })
              }
            }}
          >
            Approve application
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function hasFarcasterAccount(user?: User) {
  return user?.fid !== undefined
}
