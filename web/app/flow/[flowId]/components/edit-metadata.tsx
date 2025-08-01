"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileInput } from "@/components/ui/file-input"
import { useSetMetadata } from "../hooks/useSetMetadata"
import { useRouter } from "next/navigation"
import { Pencil1Icon } from "@radix-ui/react-icons"
import { getIpfsUrl } from "@/lib/utils"

interface Props {
  flow: {
    title: string
    image: string
    tagline?: string | null
    description: string
    url?: string | null
  }
  contract: `0x${string}`
  chainId: number
  canEdit: boolean
}

export function EditMetadataDialog({ flow, contract, chainId, canEdit }: Props) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: flow.title,
    image: flow.image,
    tagline: flow.tagline || "",
    description: flow.description,
    url: flow.url || "",
  })
  const router = useRouter()

  const { setMetadata, isLoading } = useSetMetadata({
    contract,
    chainId,
    onSuccess: () => {
      setOpen(false)
      // wait 500ms before refreshing
      setTimeout(() => {
        router.refresh()
      }, 500)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMetadata(formData)
  }

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!canEdit) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil1Icon className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Flow Metadata</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Image (square)</Label>
                <FileInput
                  name="image"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  existingImage={getIpfsUrl(formData.image)}
                  onSuccess={(url) => handleFieldChange("image", url)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => handleFieldChange("tagline", e.target.value)}
                  placeholder="Short and sweet"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleFieldChange("url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={14}
                value={formData.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                className="min-h-[200px] md:min-h-[300px]"
                placeholder="Describe your flow..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  title: flow.title,
                  image: flow.image,
                  tagline: flow.tagline || "",
                  description: flow.description,
                  url: flow.url || "",
                })
                setOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading} disabled={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
