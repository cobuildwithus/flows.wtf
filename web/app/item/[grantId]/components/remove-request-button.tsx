"use client"

"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { AuthButton } from "@/components/ui/auth-button"
import { flushSync } from "react-dom"

interface GrantRemoveRequestButtonProps {
  text?: string
  variant?: "default" | "secondary"
  initialMessage?: string
}

export function GrantRemoveRequestButton({
  text = "Request Removal",
  variant = "default",
  initialMessage = "I want to request removal of this grant. Please help me submit my request.",
}: GrantRemoveRequestButtonProps) {
  const { setIsOpen, setContext, setMessages, reload } = useAgentChat()

  return (
    <AuthButton
      variant={variant}
      size="lg"
      onClick={() => {
        flushSync(() => {
          setContext(
            `User clicked the "Request Removal" button on the grant page.
            
            Begin collecting their removal request and prepare it for submission.

            If you can convince the user to leave feedback instead of requesting removal, do so.
            
            Follow instructions for the grant removal request and try to understand their reasons for removal and their validity before proceeding.`,
          )
        })
        setMessages([
          {
            role: "user",
            content: initialMessage,
            id: "1",
          },
        ])
        reload()
        setIsOpen(true)
      }}
    >
      {text}
    </AuthButton>
  )
}
