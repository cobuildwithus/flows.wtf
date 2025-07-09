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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileInput } from "@/components/ui/file-input"
import { Textarea } from "@/components/ui/textarea"
import { useLogin } from "@/lib/auth/use-login"
import { useState } from "react"
import { Plus } from "lucide-react"
import { AddRecipientToFlowButton } from "@/components/global/add-recipient-to-flow-button"
import { Grant } from "@/lib/database/types"
import { ComponentProps } from "react"
import { SearchRecipient } from "./search-recipient/search-recipient"
import { RemoveScroll } from "react-remove-scroll"

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

  // Handler for form field changes
  const handleFieldChange = (field: string, value: string) => {
    setRecipient((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <AuthButton {...buttonProps}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </AuthButton>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add builder</DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-muted-foreground">
            Pay a new builder
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Recipient Component */}
          <SearchRecipient flow={flow} disabled={!isConnected} onRecipientChange={setRecipient} />

          {/* Form to edit recipient details */}
          {recipient && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={recipient.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    placeholder="Enter builder title"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="image">Image (square)</Label>
                  <FileInput
                    name="image"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onSuccess={(url: string) => handleFieldChange("image", url)}
                    existingImage={recipient.image}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={recipient.tagline}
                    onChange={(e) => handleFieldChange("tagline", e.target.value)}
                    placeholder="Short and sweet"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>

                  <Textarea
                    id="description"
                    value={recipient.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    placeholder="What the builder is working on..."
                    style={{ minHeight: 200 }}
                  />
                </div>
              </div>
            </div>
          )}

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
