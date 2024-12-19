import { ChatData } from "@/app/chat/chat-body"
import { queryEmbeddingsTool } from "@/lib/ai/tools/embeddings/tool"
import { getTools, getToolsPrompt, Tool } from "@/lib/ai/tools/tool"
import database from "@/lib/database/edge"
import { cache } from "react"
import { aboutPrompt } from "../../prompts/about"
import { getAllNounishCitizensPrompt } from "../../prompts/nounish-citizens"
import { getUserDataPrompt } from "../../prompts/user-data"
import { updateStoryTool } from "../../tools/stories/update-story"
import { Agent } from "../agent"
import { gonzoPersonalityPrompt } from "./personality"
import { canEditStory } from "@/lib/database/helpers"
import { serialize } from "@/lib/serialize"

export async function getGonzo(data: ChatData): Promise<Agent> {
  const tools: Tool[] = [queryEmbeddingsTool]

  if (data.storyId && data.address) {
    const story = await getStory(data.storyId)

    if (story && canEditStory(story, data.address)) {
      tools.push(updateStoryTool)
    }
  }

  return {
    prompt: await getGonzoPrompt(data, tools),
    tools: getTools(tools),
  }
}

async function getGonzoPrompt(data: ChatData, tools: Tool[]) {
  const about = `${aboutPrompt}\n\n`
  const personality = `${gonzoPersonalityPrompt}\n`
  const story = await getStoryPrompt(data.storyId)
  const userData = await getUserDataPrompt(data.address)
  const dataPrompt = getDataPrompt(data)
  const nounishCitizens = await getAllNounishCitizensPrompt()
  const toolsPrompt = getToolsPrompt(tools)

  return `
  ${about}
  ${personality}
  ${story}
  ${userData}
  ${dataPrompt}
  ${nounishCitizens}
  ${toolsPrompt}
  `
}

function getDataPrompt(data: ChatData) {
  if (!data || Object.keys(data).length === 0) return ""
  return `\n\n# Additional data:\n${JSON.stringify(data)}`
}

async function getStoryPrompt(storyId: string | undefined) {
  if (!storyId) return ""

  const story = await getStory(storyId)
  if (!story) return ""

  return `\n\n## Story:\nContext about the current story:\n${JSON.stringify(story)}`
}

const getStory = cache(async (storyId: string) => {
  return database.story.findFirst({ where: { id: storyId } })
})
