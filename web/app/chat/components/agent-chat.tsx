"use client"

import { User } from "@/lib/auth/user"
import { AgentType } from "@/lib/enums"
import { Attachment, Message } from "ai"
import { useChat, UseChatHelpers } from "ai/react"
import { useRouter } from "next/navigation"
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react"
import { flushSync } from "react-dom"
import { ChatBody, ChatData } from "../chat-body"
import { useChatHistory } from "./use-chat-history"

interface Props {
  id: string
  type: AgentType
  user?: User
  data?: ChatData
  initialMessages?: Message[]
  identityToken: string | undefined
}

interface AgentChatContext extends UseChatHelpers {
  restart: () => void
  attachments: Attachment[]
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>
  user?: User
  context: string
  setContext: React.Dispatch<React.SetStateAction<string>>
  type: AgentType
  hasStartedStreaming: boolean
  appendData: (data: ChatData) => void
}

const AgentChatContext = createContext<AgentChatContext | undefined>(undefined)

export function AgentChatProvider(props: PropsWithChildren<Props>) {
  const { id, type, user, initialMessages, children, identityToken } = props
  const { readChatHistory, storeChatHistory, resetChatHistory } = useChatHistory({ id })
  const [attachments, setAttachments] = useState<Array<Attachment>>([])
  const [context, setContext] = useState("")
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false)
  const router = useRouter()
  const [data, setData] = useState<ChatData | undefined>(props.data)

  const chat = useChat({
    id,
    api: `${process.env.NEXT_PUBLIC_CHAT_API_URL ?? "http://localhost:4000"}/api/chat`,
    body: { type, id, data, context } satisfies Omit<ChatBody, "messages">,
    initialMessages: initialMessages || readChatHistory(),
    keepLastMessageOnError: true,
    streamProtocol: "data",
    headers: {
      "privy-id-token": identityToken || "",
      city: user?.location?.city || "",
      country: user?.location?.country || "",
      "country-region": user?.location?.countryRegion || "",
    },
    onToolCall: ({ toolCall }) => {
      switch (toolCall.toolName) {
        case "updateGrant":
        case "updateStory":
          router.refresh()
          break
        default:
          break
      }
    },
    onResponse: () => {
      setHasStartedStreaming(true)
    },
    onFinish: () => {
      setHasStartedStreaming(false)
    },
  })

  const restart = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset the conversation? This will clear the entire chat history.",
    )
    if (!confirmed) return
    resetChatHistory()
    chat.setMessages([])
    chat.reload()
  }

  useEffect(() => {
    storeChatHistory(chat.messages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.messages])

  return (
    <AgentChatContext.Provider
      value={{
        ...chat,
        type,
        restart,
        attachments,
        setAttachments,
        user,
        context,
        setContext,
        hasStartedStreaming,
        appendData: (data: ChatData) => {
          flushSync(() => {
            setData((prev) => ({ ...prev, ...data }))
          })
        },
      }}
    >
      {children}
    </AgentChatContext.Provider>
  )
}

export function useAgentChat() {
  const context = useContext(AgentChatContext)
  if (context === undefined) {
    throw new Error("useAgentChat must be used within an AgentChatProvider")
  }
  return context
}
