"use client"

import { Button } from "@/components/ui/button"
import { Draft } from "@prisma/flows"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAccount } from "wagmi"
import { deleteDraft } from "./delete-draft"
import { useCanManageDraft } from "./use-can-manage-draft"

interface Props {
  draft: Draft
  edit?: boolean
}

export function DraftEditButton(props: Props) {
  const { draft, edit } = props
  const canEdit = useCanManageDraft(draft)
  const { address } = useAccount()
  const router = useRouter()

  if (!canEdit) return null

  if (edit) {
    return (
      <>
        <Link href={`/draft/${draft.id}`}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" form="draft-edit">
          Save
        </Button>
      </>
    )
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        onClick={async () => {
          if (window.confirm("Are you sure you want to delete this draft?")) {
            const result = await deleteDraft(draft.id, address)
            if (result.error) {
              toast.error(result.error)
            } else {
              toast.success("Draft deleted")
              router.push(`/flow/${draft.flowId}/drafts`)
            }
          }
        }}
      >
        Delete
      </Button>
      <Link href={`/draft/${draft.id}?edit=true`}>
        <Button type="button">Edit</Button>
      </Link>
    </>
  )
}
