"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { Messages } from "@/app/chat/components/messages"
import { MultimodalInput } from "@/app/chat/components/multimodal-input"
import { AuthButton } from "@/components/ui/auth-button"
import { ButtonProps } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Props {
  startupId: string
  opportunityId: string
  position: string
  size?: ButtonProps["size"]
}

export function ApplyOpportunity(props: Props) {
  const { opportunityId, position, startupId, size } = props
  const { messages, isOpen, setIsOpen, appendData, setMessages, reload } = useAgentChat()

  return (
    <>
      <AuthButton
        size={size}
        className="w-full rounded-sm py-0.5"
        type="button"
        variant="ai-primary"
        onClick={() => {
          appendData({ opportunityId, startupId })
          setMessages([
            {
              role: "user",
              content: `Hi, I'm interested in applying for this opportunity: ${position}`,
              id: "1",
            },
          ])
          reload()
          setIsOpen(true)
        }}
      >
        Apply
      </AuthButton>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-screen-md pb-0 max-sm:px-0">
          <DialogHeader className="max-sm:px-4">
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate py-1">Join our team</span>
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
