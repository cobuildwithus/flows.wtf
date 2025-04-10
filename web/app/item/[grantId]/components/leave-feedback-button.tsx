"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { AuthButton } from "@/components/ui/auth-button"
import { flushSync } from "react-dom"

export function LeaveFeedbackButton({
  grantId,
  builderUsername,
  text = "Leave feedback",
  variant = "secondary",
  initialMessage = "I want to leave feedback or ask the builder a question please",
}: {
  grantId: string
  builderUsername: string
  text?: string
  variant?: "default" | "secondary"
  initialMessage?: string
}) {
  const { setIsOpen, setContext, setMessages, reload } = useAgentChat()

  return (
    <AuthButton
      variant={variant}
      size="xs"
      onClick={() => {
        flushSync(() => {
          setContext(
            `User clicked the "Leave Feedback" button on the grant page.
          
          Begin collecting their feedback and prepare it for submission via the cast preview tool.
          
          Critical instructions:
          - Do NOT provide ANY examples, suggestions, or ideas for feedback.
          - Do NOT mention general categories or types of feedback.
          - Simply ask: "What feedback would you like to leave for the builder?" and wait for their response.
          - Any examples or suggestions, even general ones, violate this instruction.
          - Do NOT use other tools; only assist the user in quickly submitting their feedback through the cast preview tool.
          
          When using the cast preview tool:
          - Use the user's feedback text directly.
          - Set the parent_url to: https://flows.wtf/item/${grantId}
          - Begin the message with @${builderUsername || "the builder's farcaster username (try to extract it from their grant text)"}.
          If the builder does not have a farcaster username available, inform the user that you cannot find it and don't include @[username] in the message.`,
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
