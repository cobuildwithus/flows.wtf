"use client"

import { User } from "@/lib/auth/user"
import { AgentType } from "@/lib/enums"
import { type UIMessage, DefaultChatTransport } from "ai"
import { useChat, type UseChatHelpers } from "@ai-sdk/react"
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
  initialMessages?: UIMessage[]
  identityToken: string | undefined
}

type AttachmentState = {
  url: string
  name?: string
  contentType?: string
  imageUrl?: string
  videoUrl?: string
}

interface AgentChatContext extends UseChatHelpers<UIMessage> {
  restart: () => void
  attachments: AttachmentState[]
  setAttachments: React.Dispatch<React.SetStateAction<AttachmentState[]>>
  user?: User
  context: string
  setContext: React.Dispatch<React.SetStateAction<string>>
  type: AgentType
  hasStartedStreaming: boolean
  appendData: (data: ChatData) => void
  data: ChatData | undefined
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  // v5 wrappers for legacy API used by UI components
  input: string
  setInput: React.Dispatch<React.SetStateAction<string>>
  handleSubmit: (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: AttachmentState[] },
  ) => void
  append: (message: { role: "user" | "assistant"; content: string }) => void
  isLoading: boolean
}

const AgentChatContext = createContext<AgentChatContext | undefined>(undefined)

export function AgentChatProvider(props: PropsWithChildren<Props>) {
  const { id, type, user, initialMessages, children, identityToken } = props
  const { readChatHistory, storeChatHistory, resetChatHistory } = useChatHistory({ id })
  const [attachments, setAttachments] = useState<Array<AttachmentState>>([])
  const [context, setContext] = useState("")
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false)
  const router = useRouter()
  const [data, setData] = useState<ChatData | undefined>(props.data)
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")

  const chat = useChat({
    id,
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_CHAT_API_URL ?? "http://localhost:4000"}/api/chat`,
      body: { type, id, data, context } satisfies Omit<ChatBody, "messages">,
      headers: {
        "privy-id-token": identityToken || "",
        city: user?.location?.city || "",
        country: user?.location?.country || "",
        "country-region": user?.location?.countryRegion || "",
      },
    }),
    messages: initialMessages || readChatHistory(),
    onToolCall: ({ toolCall }) => {
      const toolName =
        (toolCall as unknown as { toolName?: string; name?: string }).toolName ??
        (toolCall as unknown as { toolName?: string; name?: string }).name
      switch (toolName) {
        case "updateGrant":
        case "updateStory":
        case "updateImpact":
        case "submitOpportunityApplication":
          router.refresh()
          break
        default:
          break
      }
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
  }

  useEffect(() => {
    storeChatHistory(chat.messages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.messages])

  const isLoading = chat.status === "submitted" || chat.status === "streaming"

  function attachmentsToFileParts(list: AttachmentState[]) {
    return list.map((a) => ({
      type: "file" as const,
      url: a.url,
      mediaType:
        a.contentType ||
        (a.url.endsWith(".m3u8") ? "application/vnd.apple.mpegurl" : "application/octet-stream"),
      filename: a.name,
    }))
  }

  const handleSubmit: AgentChatContext["handleSubmit"] = async (event, options) => {
    event?.preventDefault?.()
    const atts = options?.experimental_attachments ?? attachments
    const files = attachmentsToFileParts(atts)
    const text = input.trim()
    if (!text && files.length === 0) return
    setHasStartedStreaming(true)
    if (text && files.length) {
      await chat.sendMessage({ text, files })
    } else if (text) {
      await chat.sendMessage({ text })
    } else {
      await chat.sendMessage({ files })
    }
    setInput("")
    setAttachments([])
  }

  const append: AgentChatContext["append"] = async ({ content }) => {
    if (!content?.trim()) return
    setHasStartedStreaming(true)
    await chat.sendMessage({ text: content })
  }

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
        data,
        isOpen,
        setIsOpen,
        input,
        setInput,
        handleSubmit,
        append,
        isLoading,
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
