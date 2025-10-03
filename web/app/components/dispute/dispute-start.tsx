"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { canBeChallenged } from "@/app/components/dispute/helpers"
import { AuthButton } from "@/components/ui/auth-button"
import { ButtonProps } from "@/components/ui/button"
import { Grant } from "@prisma/flows"
import { flushSync } from "react-dom"

interface DisputeStartButtonProps {
  grant: Grant
  flow: Grant
  text?: string
  variant?: ButtonProps["variant"]
  className?: string
  initialMessage?: string
}

export function DisputeStartButton({
  grant,
  flow,
  text,
  variant = "outline",
  className,
  initialMessage,
}: DisputeStartButtonProps) {
  const { setIsOpen, setContext, append } = useAgentChat()

  const type = grant.isActive ? "removal request" : "application"
  const buttonText = text || `Challenge ${type}`
  const defaultMessage =
    initialMessage || `I want to challenge this ${type}. Please help me submit my challenge.`

  return (
    <AuthButton
      variant={variant}
      className={className}
      disabled={!canBeChallenged(grant)}
      onClick={() => {
        flushSync(() => {
          setContext(
            `User clicked the "Challenge ${type}" button on the grant page.
            
            Begin collecting information for their challenge and prepare it for submission.

            This is for grant "${grant.title}" in flow "${flow.title}".
            
            Follow these steps:
            1. Explain that challenging costs tokens and will kick off a voting period
            2. Ask for their reasoning for the challenge, referencing the flow requirements
            3. Explain that token holders will vote on the challenge
            4. Explain the consequences of the challenge (losing tokens if rejected, gaining if successful)
            5. Check if they have enough tokens and guide them through the process

            If the user is challenging a removal request, that means they are challenging someone else's request to remove the grant.
            Make sure to inform the user the reasoning for the initial removal request that they are now challenging to make sure they address it.
            The same rules apply, they're just challenging a removal request instead of an application. 
            
            Make sure to collect a clear reason for the challenge before proceeding.`,
          )
        })
        append({ role: "user", content: defaultMessage })
        setIsOpen(true)
      }}
    >
      {buttonText}
    </AuthButton>
  )
}
