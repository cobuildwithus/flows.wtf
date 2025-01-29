import { kv } from "@vercel/kv"
import { cache } from "react"
import { z } from "zod"

const schema = z.object({
  text: z.string().describe("The guidance message to the user."),
  action: z
    .object({
      text: z.string().max(12).describe("The text of the action button."),
      link: z.string().optional().nullable().describe("The link of the action button."),
      isChat: z.boolean().default(false).describe("Whether to open the chat dialog."),
    })
    .describe("Action the user can take."),
})

export type Guidance = z.infer<typeof schema>

export const getGuidance = cache(
  async (address?: string, identityToken?: string): Promise<Guidance> => {
    if (!address) return defaultGuidance

    try {
      const { data: cachedGuidance } = schema.safeParse(await kv.get(cacheKey(address)))
      if (cachedGuidance) return cachedGuidance

      if (!identityToken) throw new Error(`Missing identity token for user ${address}`)

      const response = await fetch(`${process.env.NEXT_PUBLIC_CHAT_API_URL}/api/guidance`, {
        headers: { "privy-id-token": identityToken },
      })

      const { data: guidance, error } = schema.safeParse({
        text: await response.text(),
        action: { text: "Let's talk", isChat: true },
      })
      if (!guidance) throw new Error(`Guidance validation failed! ${error}`)

      await kv.set(cacheKey(address), guidance, { ex: 60 * 60 * 12 })

      return guidance
    } catch (e) {
      console.error(e)
      return defaultGuidance
    }
  },
)

export function cacheKey(address: string) {
  return `guidance-v11-${address?.toLowerCase()}`
}

const defaultGuidance: Guidance = {
  text: "We pay people to make positive impact in their communities.\n\nWhatever your passion, there's a place for you here. We support people who make a difference doing what they love.",
  action: {
    text: "Let's talk",
    isChat: true,
  },
}
