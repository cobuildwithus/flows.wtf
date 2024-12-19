"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { Messages } from "@/app/chat/components/messages"
import { MultimodalInput } from "@/app/chat/components/multimodal-input"
import { LoginButton } from "@/components/global/login-button"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Grant } from "@prisma/flows"
import { RotateCcw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import StartImage from "./start.svg"
import { useRecipientExists } from "./useRecipientExists"

interface Props {
  flow: Grant
  title?: string
  subtitle?: string
}

export function ApplicationChat(props: Props) {
  const { flow, title, subtitle } = props

  const { messages, restart, user, append, isLoading } = useAgentChat()

  const recipientExists = useRecipientExists(flow.recipient, user?.address)

  return (
    <div className="flex h-[calc(100dvh-68px)] min-w-0 flex-col">
      {!user && (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2.5">
              <LoginButton size="lg" />
            </div>
            <p className="text-sm text-muted-foreground">Please log in to continue</p>
          </div>
        </div>
      )}

      {user && messages.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 max-sm:pr-2 max-sm:pt-0 md:ml-4">
          <div className="md:flex md:grow md:flex-col md:items-center md:justify-center">
            {title && <h1 className="text-sm font-medium">{title}</h1>}
            {subtitle && <h3 className="text-xs text-muted-foreground">{subtitle}</h3>}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={restart}
                className="text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Restart</TooltipContent>
          </Tooltip>
        </div>
      )}

      {user && messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center px-4">
          <Image src={StartImage} alt="Let's start!" width={256} height={256} />
          <p className="mb-4 mt-8 text-center">Apply for {flow.title}</p>
          <Button
            onClick={() => {
              if (recipientExists) {
                toast.error("You have already applied to this flow")
                return
              }

              append({
                role: "user",
                content: `Hi, I want to apply for a grant in ${flow.title}... Can we start the application?`,
              })
            }}
            size="xl"
            loading={isLoading}
          >
            Let&apos;s start!
          </Button>
          <div className="mt-2.5 text-center">
            <Link
              href={`/apply/${flow.id}/manual`}
              className="text-xs text-muted-foreground hover:underline"
            >
              Apply manually
            </Link>
          </div>
        </div>
      )}

      {user && messages.length > 0 && <Messages />}

      {messages.length > 0 && <MultimodalInput className="bg-background px-4 pb-4 md:pb-6" />}
    </div>
  )
}
