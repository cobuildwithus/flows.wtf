"use client"

import { Input } from "@/components/ui/input"
import { Markdown } from "@/components/ui/markdown"
import { MarkdownInput } from "@/components/ui/markdown-input"
import { getIpfsUrl } from "@/lib/utils"
import { Draft } from "@prisma/flows"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useAccount } from "wagmi"
import { updateDraft } from "./update-draft"
import { useCanManageDraft } from "./use-can-manage-draft"

interface Props {
  draft: Draft
  edit?: boolean
  markdown: string
}

export default function DraftContent(props: Props) {
  const { draft, markdown, edit = false } = props
  const { image, title } = draft
  const [isEditMode, setIsEditMode] = useState(false)
  const { address } = useAccount()
  const router = useRouter()
  const canEdit = useCanManageDraft(draft)

  useEffect(() => {
    setIsEditMode(edit && canEdit)
  }, [edit, canEdit])

  async function handleSubmit(formData: FormData) {
    if (!canEdit) return

    const result = await updateDraft(draft.id, formData, address)
    if (result.error) {
      toast.error(result.error)
    } else {
      router.push(`/draft/${draft.id}`)
      toast.success("Draft saved!")
    }
  }

  return (
    <form action={handleSubmit} id="draft-edit" className="flex h-full flex-col">
      <div className="flex items-center space-x-4">
        <Image
          src={getIpfsUrl(image, "pinata")}
          alt={title}
          width={64}
          height={64}
          className="size-16 shrink-0 rounded-md object-cover"
        />
        <div className="w-full">
          {!isEditMode && <h1 className="text-xl font-bold md:text-3xl">{title}</h1>}
          {isEditMode && (
            <Input
              defaultValue={title}
              name="title"
              id="title"
              className="h-12 w-full text-xl font-bold md:text-3xl"
            />
          )}
        </div>
      </div>
      <div className="mt-6 grow space-y-5 text-pretty text-sm md:text-base">
        {!isEditMode && <Markdown>{markdown}</Markdown>}
        {isEditMode && (
          <MarkdownInput
            name="description"
            initialValue={markdown}
            className="h-full"
            minHeight={480}
          />
        )}
      </div>
    </form>
  )
}
