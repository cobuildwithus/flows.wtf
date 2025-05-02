"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { Messages } from "@/app/chat/components/messages"
import { MultimodalInput } from "@/app/chat/components/multimodal-input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User } from "@/lib/auth/user"
import { RotateCcw } from "lucide-react"
import { useState } from "react"

interface Props {
  user?: User
  context: string
  trigger: React.ReactNode
  initialContext: string
  initialMessage: string
}

export function HelpChat(props: Props) {
  const { user, trigger, initialContext, initialMessage } = props
  const [isOpen, setIsOpen] = useState(false)
  const { append, messages, restart, setContext } = useAgentChat()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div
        onClick={() => {
          setIsOpen(true)
          if (messages.length === 0) {
            setContext(`${initialContext}. Keep your initial response short and concise.`)
            append({ role: "user", content: initialMessage })
          }
        }}
      >
        {trigger}
      </div>
      <DialogContent className="max-w-none pb-0 max-sm:px-0">
        <DialogHeader className="max-sm:px-4">
          <DialogTitle className="flex items-center">
            Conversation with Flo
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
          <MultimodalInput className="bg-background px-4 pb-4 md:pb-6" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
