"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { Messages } from "@/app/chat/components/messages"
import { MultimodalInput } from "@/app/chat/components/multimodal-input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLogin } from "@/lib/auth/use-login"
import { User } from "@/lib/auth/user"

interface Props {
  user: User | undefined
  opportunityId: string
  position: string
}

export function ApplyOpportunity(props: Props) {
  const { user, opportunityId, position } = props
  const { messages, restart, isOpen, setIsOpen, appendData, setMessages, reload } = useAgentChat()
  const { login } = useLogin()

  return (
    <>
      <Button
        size="sm"
        className="mt-3 py-0.5"
        type="button"
        onClick={() => {
          if (!user) {
            login()
            return
          }

          appendData({ opportunityId })
          setMessages([
            {
              role: "user",
              content: `Hi, I'm interested in this opportunity: ${position}`,
              id: "1",
            },
          ])
          reload()
          setIsOpen(true)
        }}
      >
        Apply
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-screen-md pb-0 max-sm:px-0">
          <DialogHeader className="max-sm:px-4">
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate py-1">Application</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex h-[calc(100dvh-100px)] min-w-0 flex-col">
            {messages.length > 0 && <Messages />}
            <MultimodalInput className="bg-background p-2" autoFocus />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
