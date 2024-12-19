"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { Messages } from "@/app/chat/components/messages"
import { MultimodalInput } from "@/app/chat/components/multimodal-input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLogin } from "@/lib/auth/use-login"
import { User } from "@/lib/auth/user"
import { RotateCcw } from "lucide-react"
import { useState } from "react"

interface Props {
  user?: User
  children: string
  context: string
}

export function GuidanceChat(props: Props) {
  const { user, children: buttonText, context } = props
  const [isOpen, setIsOpen] = useState(false)
  const { append, messages, restart, setContext } = useAgentChat()
  const { login } = useLogin()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ai-secondary"
        size="md"
        type="button"
        onClick={() => {
          if (!user) return login()
          setIsOpen(true)
          if (messages.length === 0) {
            setContext(
              `User just clicked the "${buttonText}" button to open chat with you. This happened after he saw this message on homepage: ${context}`,
            )
            append({ role: "user", content: buttonText })
          }
        }}
      >
        {buttonText}
      </Button>
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
