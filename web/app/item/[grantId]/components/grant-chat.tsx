"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { Messages } from "@/app/chat/components/messages"
import { MultimodalInput } from "@/app/chat/components/multimodal-input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User } from "@/lib/auth/user"
import { Grant } from "@prisma/flows"
import { RotateCcw } from "lucide-react"

interface Props {
  user?: User
  grant: Grant
  canEdit: boolean
}

export function GrantChat(props: Props) {
  const { user, grant, canEdit } = props
  const { messages, restart, isOpen, setIsOpen } = useAgentChat()

  return (
    <>
      <div
        className="fixed bottom-4 left-0 right-0 z-40"
        onClick={(e) => {
          if (messages.length > 0 && !isOpen && user) {
            e.stopPropagation()
            setIsOpen(true)
          }
        }}
      >
        <MultimodalInput
          rows={1}
          className="max-w-[90vw] rounded-2xl border border-background md:max-w-2xl"
          placeholder={canEdit ? `Edit this grant...` : `Ask about this grant...`}
          onSubmit={() => {
            if (!isOpen) setIsOpen(true)
          }}
        />
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-screen-md pb-0 max-sm:px-0">
          <DialogHeader className="max-sm:px-4">
            <DialogTitle className="flex items-center">
              Ask about&nbsp;<span className="max-w-[400px] truncate">{grant.title}</span>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={restart}
                className="ml-2.5 text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="size-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex h-[calc(100dvh-100px)] min-w-0 flex-col">
            {user && messages.length > 0 && <Messages />}
            <MultimodalInput className="bg-background p-2" autoFocus />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
