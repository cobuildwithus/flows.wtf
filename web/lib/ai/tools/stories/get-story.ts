import database from "@/lib/database/edge"
import { tool } from "ai"
import { z } from "zod"
import { Tool } from "../tool"

export const getStoryTool = {
  name: "getStory",
  prompt: `### Get Story tool
    You have access to the getStory tool that retrieves comprehensive narratives about grants in the Flows ecosystem.

    To use: Simply provide a storyId to get the full story data.

    #### About stories
    Each story is a gonzo-style piece that captures both facts and atmosphere.
    A Story contains:
    
    CORE NARRATIVE
        
    Title: The hook that draws readers in
    Tagline: The essence in one punchy line
    Summary: The main narrative in markdown format, written in immersive gonzo style

    CONTEXT & SUBSTANCE

    Key Points: Critical insights and revelations
    Timeline: The sequence of significant moments

    EVIDENCE & ATMOSPHERE

    Media: Images and videos that capture the vibe
    Sources: Where the raw material came from (usually casts)
    Metadata: Author details, timestamps, etc.

    Stories serve multiple purposes:

    - Document the evolution of grants in their natural habitat
    - Capture the human element behind the technology
    - Connect individual narratives to larger ecosystem themes
    - Preserve important moments in Nouns history
    - Make complex developments accessible and engaging

    Remember: These aren't just dry reports - they're living documents that capture 
    both the facts and the feeling of building in web3. Each story should give readers 
    the sense of being there, understanding not just what happened, but what it felt 
    like to be part of it.


    #### About the data format
    The data is returned in JSON format.

    "author" field is eth address of the user who created the story - usually AI agent, it may be your wallet address.
    "participants" field is an array of eth addresses of the users who participated in the story. Each participant is allowed
    to edit the story - using separate tool, that is available to you when you talk to the story participant.
  `,
  tool: tool({
    parameters: z.object({ storyId: z.string() }),
    description: "Get the story by id",
    execute: async ({ storyId }) => {
      console.debug(`Getting the story ${storyId}`)

      return await database.story.findFirstOrThrow({ where: { id: storyId } })
    },
  }),
} satisfies Tool
