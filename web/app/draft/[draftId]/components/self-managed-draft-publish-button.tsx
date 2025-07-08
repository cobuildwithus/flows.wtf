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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddRecipientToFlowButton } from "@/components/global/add-recipient-to-flow-button"
import type { DerivedData, Draft, Grant } from "@prisma/flows"
import { useRef } from "react"
import type { User } from "@/lib/auth/user"
import SignInWithNeynar from "@/components/global/signin-with-neynar"
import { AuthButton } from "@/components/ui/auth-button"
import { AddFlowToFlowButton } from "@/components/global/add-flow-to-flow-button"
import { publishDraft } from "../publish-draft"

interface Props {
  draft: Draft
  flow: Grant & { derivedData: DerivedData | null }
  size?: "default" | "sm"
  user: User
}

export function ManagedFlowDraftPublishButton(props: Props) {
  const { draft, flow, size = "default", user } = props
  const ref = useRef<HTMLButtonElement>(null)

  if (!hasFarcasterAccount(user)) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <AuthButton type="button" ref={ref} size={size}>
            Add to flow
          </AuthButton>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Farcaster required</AlertDialogTitle>
            <AlertDialogDescription className="pt-1.5 leading-relaxed">
              Connect your Farcaster account to your wallet to add to a flow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {user && <SignInWithNeynar variant="default" user={user} />}
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
          {draft.opportunityId ? "Approve application" : "Add to flow"}
        </AuthButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to the {flow.title} flow</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This is a self managed flow. You can add and remove applicants at any time, and set a
            custom flow rate for each applicant.
          </p>
          <div className="flex justify-end">
            {flow.isAccelerator ? (
              <AddFlowToFlowButton
                flow={{
                  title: draft.title,
                  description: draft.description,
                  image: draft.image,
                  tagline: draft.tagline || "",
                  manager: draft.users[0],
                }}
                contract={flow.recipient as `0x${string}`}
                chainId={flow.chainId}
                buttonText={draft.opportunityId ? "Hire" : "Create flow"}
                onSuccess={async (hash) => {
                  await publishDraft(draft.id, hash)
                  ref.current?.click() // close dialog
                }}
              />
            ) : (
              <AddRecipientToFlowButton
                recipient={{
                  address: draft.users[0],
                  title: draft.title,
                  description: draft.description,
                  image: draft.image,
                  tagline: draft.tagline || "",
                }}
                contract={flow.recipient as `0x${string}`}
                chainId={flow.chainId}
                buttonText={draft.opportunityId ? "Hire" : "Add to flow"}
                onSuccess={async (hash) => {
                  await publishDraft(draft.id, hash)
                  ref.current?.click() // close dialog
                }}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function hasFarcasterAccount(user?: User) {
  return user?.fid !== undefined
}
