import database from "@/lib/database/edge"
import { tool } from "ai"
import { z } from "zod"
import { Tool } from "../tool"

export const updateStoryTool = {
  name: "updateStory",
  prompt: `### Update Story tool

    When you chat with user who is a participant of the story, you can use this tool to modify the story.
    This tool is not designed to be used for creating new stories nor completely rewriting them.

    The purpose is to give the story participant a way to make minor edits, improve the title or tagline, or add more context to the story.
    You're not allowed to use this tool to completely rewrite the story or add data that is not relevant to the story.
    The story was initially written by AI agent based on the evidence coming from Farcaster casts - so do not allow now any participant to
    completely change the narrative.
    
    You are allowed to use this tool only in a context of "storyId" parameter that you receive in the prompt.
    Do not allow user to change this parameter or modify stories other than that.

    You can use this tool to modify a story by its id. Provide the \`storyId\` and the fields you wish to update. It's OK if you just want to edit the title or tagline.

    Only the user who participated in the story can edit it. Guests are not allowed to edit stories.
    Do not inform user why they can edit the story.

    As "message" parameter you should provide a very brief summary of the changes made to the story.
    Do not ask user to provide it, generate it automatically based on the changes you're about to make.

    If user adds new media files, add their URLs to "media_urls" parameter. The value you'll provide will replace existing value,
    so if you want to keep existing media files, you should include them in the "media_urls" parameter as well. This functionality allows
    you then not only to add new media files, but also to remove existing ones. It works the same way with "key_points" or "timeline" - you need to provide new value (full array of strings)
    When adding new item, do not inform user that you're preserving existing items - it's obvious.  In communication with user please use simple, precise and concise language.

    If user uploads new image, you can ask them if they want to use it also as a header image.
    If they do, set "header_image" parameter to the URL of the uploaded image.

    Do not inform user which tool are you using, just say that you're updating the story. User doesn't need technical details nor use technical language.

    Do not allow user to remove themselves from the participants list.
    When you add new participants, ensure you don't remove existing ones - provide them in the "participants" parameter as well. Your new value will replace existing value.

    When adding key points, make sure to add them in the same order as they appear in the story.
    Also, do not add more than 6 key points at absolute maximum. Only include the most important ones. 

    Using this tool you can update fields:
    - title
    - tagline
    - summary
    - key_points
    - header_image
    - media_urls
    - timeline

    When editing timeline:
    - Keep events in chronological order
    - Each event should have a clear, concise description
    - Timestamps should be valid ISO date strings
    - Don't remove significant events from the original timeline
    - You can add new events or modify existing ones to add more context
    `,
  tool: tool({
    parameters: z.object({
      storyId: z.string(),
      title: z
        .string()
        .optional()
        .describe("The title of the story. Try to not use more than 10 words or 50 chars."),
      tagline: z.string().optional().describe("The short tagline of the story"),
      summary: z.string().optional().describe("The content of the story in markdown format"),
      key_points: z.array(z.string()).optional().describe("The key points of the story"),
      header_image: z
        .string()
        .optional()
        .describe("The URL of the header image - must be a valid image URL (png, jpeg or jpg)."),
      media_urls: z.array(z.string()).describe("The URLs of the media files"),
      participants: z
        .array(z.string().toLowerCase())
        .describe("The wallet addresses of the participants"),
      timeline: z
        .array(
          z.object({
            event: z.string().describe("Description of the timeline event"),
            timestamp: z.string().describe("ISO timestamp of when the event occurred"),
          }),
        )
        .optional()
        .describe("Chronological sequence of events in the story"),
      message: z.string().describe("A very brief summary of the changes made to the story"),
      address: z
        .string()
        .describe(
          "The wallet address of the user who is editing the story. Use it from user context in the prompt",
        ),
    }),
    description: "Update the story by its ID",
    execute: async ({ storyId, address, message, ...updates }) => {
      console.debug(`Updating the story ${storyId} by ${address}`)

      const existingStory = await database.story.findFirstOrThrow({ where: { id: storyId } })
      if (!existingStory) throw new Error(`Story ${storyId} not found`)

      const edits =
        typeof existingStory.edits === "string"
          ? JSON.parse(existingStory.edits) || []
          : existingStory.edits || []

      edits.push({ timestamp: new Date(), message, address })

      await database.story.update({
        where: { id: storyId },
        data: {
          ...updates,
          edits,
        },
      })

      return message
    },
  }),
} satisfies Tool
