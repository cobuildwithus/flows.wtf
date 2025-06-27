"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { Messages } from "@/app/chat/components/messages"
import { MultimodalInput } from "@/app/chat/components/multimodal-input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { User } from "@/lib/auth/user"
import type { Draft } from "@prisma/flows"
import { RotateCcw } from "lucide-react"

interface Props {
  user?: User
  draft: Draft
}

export function DraftChat(props: Props) {
  const { user, draft } = props
  const { messages, restart, isOpen, setIsOpen } = useAgentChat()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-screen-md pb-0 max-sm:px-0">
        <DialogHeader className="max-sm:px-4">
          <DialogTitle className="mt-4 flex items-center justify-between">
            <span className="truncate py-1">
              <span className="hidden sm:inline">{draft.title}</span>
              <span className="inline sm:hidden">Chat</span>
            </span>
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
  )
}
