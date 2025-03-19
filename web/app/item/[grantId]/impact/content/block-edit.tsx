"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { Button } from "@/components/ui/button"

interface Props {
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  impactId: string
}

export function BlockEdit(props: Props) {
  const { isEditing, setIsEditing, impactId } = props
  const { setMessages, reload, appendData } = useAgentChat()

  return (
    <section className="mt-8 pb-4">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wide opacity-85">Manage</h3>

      {isEditing && (
        <Button
          variant="outline"
          className="rounded-2xl bg-transparent"
          onClick={() => {
            const confirmed = confirm("Are you sure you want to abort editing?")
            if (confirmed) {
              setIsEditing(false)
            }
          }}
        >
          Abort editing
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
              setMessages([{ role: "user", content: "I want to edit this impact block", id: "1" }])
              reload()
            }}
          >
            Edit Impact
          </Button>
          <Button variant="outline" className="rounded-2xl bg-transparent">
            Delete
          </Button>
        </div>
      )}
    </section>
  )
}
