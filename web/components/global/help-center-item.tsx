"use client"

import Link from "next/link"
import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { User } from "@/lib/auth/user"
import { HelpChat } from "@/app/components/action-card/help-chat"
import { useAuthClick } from "../ui/hooks/auth-click"

interface Props {
  user?: User
  identityToken?: string
}

export default function HelpCenterItem({ user, identityToken }: Props) {
  const { handleClick } = useAuthClick()

  return (
    <div>
      {user ? (
        <AgentChatProvider
          id={`footer-help-${user.address.toLowerCase()}-${new Date().toISOString().split("T")[0]}`}
          type="flo"
          user={user}
          identityToken={identityToken}
        >
          <HelpChat
            user={user}
            context="User clicked Help from the footer"
            trigger={<div className="cursor-pointer hover:underline">Get help</div>}
            initialContext="User clicked Help from the footer"
            initialMessage="Can you help me?"
          />
        </AgentChatProvider>
      ) : (
        <button onClick={handleClick} className="hover:underline">
          Help Center
        </button>
      )}
    </div>
  )
}
