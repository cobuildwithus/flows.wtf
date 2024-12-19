import { ChatData } from "@/app/chat/chat-body"
import { CoreTool } from "ai"
import { getFlo } from "./flo/flo"
import { getGonzo } from "./gonzo/gonzo"

export type AgentType = "flo" | "gonzo"

export type Agent = {
  prompt: string
  tools: Record<string, CoreTool>
}

export async function getAgent(type: AgentType, data: ChatData): Promise<Agent> {
  switch (type) {
    case "flo":
      return getFlo(data)
    case "gonzo":
      return getGonzo(data)
    default:
      throw new Error(`Unsupported agent "${type}"`)
  }
}
