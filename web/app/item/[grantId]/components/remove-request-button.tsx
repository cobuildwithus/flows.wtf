"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { AuthButton } from "@/components/ui/auth-button"
import { ButtonProps } from "@/components/ui/button"
import { flushSync } from "react-dom"

interface GrantRemoveRequestButtonProps {
  text?: string
  variant?: ButtonProps["variant"]
  initialMessage?: string
  removalType: "grant" | "flow"
}

export function GrantRemoveRequestButton({
  text = "Start removal process",
  variant = "outline",
  removalType = "grant",
  initialMessage = `I want to request removal of this ${removalType}. Please help me submit my request.`,
}: GrantRemoveRequestButtonProps) {
  const { setIsOpen, setContext, append } = useAgentChat()

  return (
    <AuthButton
      variant={variant}
      onClick={() => {
        flushSync(() => {
          setContext(
            `User clicked the "Request Removal" button on the grant page.
            
            Begin collecting their removal request and prepare it for submission.

            ${
              removalType === "flow"
                ? `This is a FLOW REMOVAL REQUEST, which is a serious action that would affect ALL grants within this flow category. This requires extra scrutiny. Before proceeding with this request, you MUST:
              
1) Get detailed reasoning from the user about why the entire flow should be removed
2) Ensure their rationale demonstrates a critical issue affecting the whole flow, not just individual grants
3) Verify they understand the widespread impact this would have
4) Only approve if there is compelling evidence that warrants complete flow removal

If their concerns are about specific grants, redirect them to individual grant removal instead.`
                : ""
            }

            If you can convince the user to leave feedback instead of requesting removal, do so.
            
            Follow instructions for the grant removal request and try to understand their reasons for removal and their validity before proceeding.`,
          )
        })
        append({ role: "user", content: initialMessage })
        setIsOpen(true)
      }}
    >
      {text}
    </AuthButton>
  )
}
