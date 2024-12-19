import { z } from "zod"

export const guidanceSchema = z.object({
  text: z.string().describe("The guidance message to the user."),
  action: z
    .object({
      text: z.string().max(12).describe("The text of the action button."),
      link: z.string().optional().describe("The link of the action button."),
      isChat: z.boolean().default(false).describe("Whether to open the chat dialog."),
    })
    .describe("Action the user can take."),
})

export function getGuidanceCacheKey(address: `0x${string}` | undefined) {
  return `guidance-v7-${address?.toLowerCase() || "guest"}`
}
