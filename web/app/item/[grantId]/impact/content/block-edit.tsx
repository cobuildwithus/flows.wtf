"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteImpact } from "../delete-impact"

interface Props {
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  impactId: string
}

export function BlockEdit(props: Props) {
  const { isEditing, setIsEditing, impactId } = props
  const { append, appendData } = useAgentChat()
  const router = useRouter()

  return (
    <section className="mt-8 pb-4">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wide opacity-85">Manage</h3>

      {isEditing && (
        <Button
          variant="outline"
          className="rounded-2xl bg-transparent"
          onClick={() => {
            const confirmed = confirm("Are you sure you want to finish editing?")
            if (confirmed) {
              setIsEditing(false)
            }
            router.refresh()
          }}
        >
          Finish editing
        </Button>
      )}

      {!isEditing && (
        <div className="flex gap-2">
          <Button
            variant="ai-secondary"
            type="button"
            onClick={() => {
              setIsEditing(true)
              appendData({ impactId })
              append({ role: "user", content: "I want to edit this impact block" })
            }}
          >
            Edit Impact
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl bg-transparent"
            onClick={async () => {
              const confirmed = confirm("Are you sure you want to delete this impact?")
              if (!confirmed) return

              const result = await deleteImpact(impactId)
              if (result.error) {
                toast.error(result.error)
              } else {
                toast.success("Impact deleted")
                router.refresh()
              }
            }}
          >
            Delete
          </Button>
        </div>
      )}
    </section>
  )
}
