"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AuthButton } from "@/components/ui/auth-button"
import { useLogin } from "@/lib/auth/use-login"
import { useState } from "react"
import { Plus } from "lucide-react"
import { AddRecipientToFlowButton } from "@/components/global/add-recipient-to-flow-button"
import { Grant } from "@/lib/database/types"
import { ComponentProps } from "react"
import { SearchRecipient } from "./search-recipient"

interface Props {
  flow: Pick<Grant, "id" | "chainId" | "recipient" | "superToken">
}

export function AddRecipientModal(props: Props & ComponentProps<typeof Button>) {
  const { flow, ...buttonProps } = props
  const [isOpen, setIsOpen] = useState(false)
  const [recipient, setRecipient] = useState<{
    address: string
    title: string
    image: string
    tagline: string
    description: string
  } | null>(null)

  const { isConnected } = useLogin()

  // Handler for successful recipient addition
  const handleAddRecipient = () => {
    setTimeout(() => {
      setRecipient(null)
      setIsOpen(false)
    }, 3000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <AuthButton {...buttonProps}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </AuthButton>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Recipient</DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-muted-foreground">
            Add a new recipient to this flow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Recipient Component */}
          <SearchRecipient flow={flow} disabled={!isConnected} onRecipientChange={setRecipient} />

          {/* Add Recipient Button */}
          <AddRecipientToFlowButton
            recipient={{
              address: recipient?.address || "",
              title: recipient?.title || "",
              image: recipient?.image || "",
              tagline: recipient?.tagline || "",
              description: recipient?.description || "",
            }}
            contract={flow.recipient as `0x${string}`}
            chainId={flow.chainId}
            size="xl"
            onSuccess={handleAddRecipient}
            disabled={!recipient}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
