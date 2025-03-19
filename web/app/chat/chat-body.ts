import { AgentType } from "@/lib/enums"
import { Message } from "ai"

export type ChatBody = {
  id: string
  messages: Array<Message>
  type: AgentType
  data?: ChatData
  context?: string
}

export type ChatData = {
  flowId?: string
  grantId?: string
  storyId?: string
  impactId?: string
}
