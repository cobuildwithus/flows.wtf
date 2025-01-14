import { AgentType } from "@/lib/ai/agents/agent"
import { Message } from "ai"

export type ChatBody = {
  id: string
  messages: Array<Message>
  type: AgentType
  data?: ChatData
  context?: string
}

export type ChatData = {
  address?: string // Remove in v2
  flowId?: string
  grantId?: string
  storyId?: string
}
