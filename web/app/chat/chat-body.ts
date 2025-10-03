import { AgentType } from "@/lib/enums"
import { type UIMessage } from "ai"

export type ChatBody = {
  id: string
  messages: Array<UIMessage>
  type: AgentType
  data?: ChatData
  context?: string
}

export type ChatData = {
  flowId?: string
  grantId?: string
  storyId?: string
  impactId?: string
  castId?: string
  startupId?: string
  opportunityId?: string
  draftId?: string
}
