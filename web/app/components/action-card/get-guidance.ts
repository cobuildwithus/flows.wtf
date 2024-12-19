import "server-only"

import { getAgent } from "@/lib/ai/agents/agent"
import { anthropic } from "@/lib/ai/providers/anthropic"
import { searchEmbeddings } from "@/lib/ai/tools/embeddings/search-embeddings"
import { FLOWS_CHANNEL_ID, NOUNS_CHANNEL_ID } from "@/lib/config"
import { streamObject } from "ai"
import { unstable_cache } from "next/cache"
import { z } from "zod"
import { guidanceSchema } from "./guidance-utils"

export async function getGuidance(
  address: `0x${string}` | undefined,
  onFinish?: (object?: z.infer<typeof guidanceSchema>) => Promise<void>,
) {
  const initialContext = await unstable_cache(
    async () => {
      const casts = await searchEmbeddings({
        types: ["cast"],
        users: address ? [address] : undefined,
        tags: [],
        numResults: 15,
        groups: [],
        orderBy: "created_at",
      })
      const grants = await searchEmbeddings({
        types: ["grant", "grant-application", "flow"],
        users: address ? [address] : undefined,
        tags: [],
        numResults: 15,
        groups: [],
        orderBy: "created_at",
      })
      return { casts, grants }
    },
    [`initial-builder-context-${address ?? "guest"}`],
    { revalidate: 3600 * 5 }, // 5 hours
  )()

  const agent = await getAgent("flo", { address })

  const result = await streamObject({
    model: anthropic("claude-3-5-sonnet-latest"),
    schema: guidanceSchema,
    onFinish: ({ object }) => onFinish?.(object),
    system: `${agent.prompt}\n\nInitial context from the database using the queryEmbeddings tool:\n${JSON.stringify(initialContext)}.`,
    prompt: `
    ${address ? `User ${address}` : "Guest"} just visited the home page of flows.wtf.

    Write a short message to the user explaining what they should do next on the platform.

    Write this message in english language. Right now we cannot ask any question to the user - we just need to display them a message, without any input from them.

    When deciding what to say, think about what the user is likely to be interested in. 
    Consider the user's profile, activity, and interests.

    Always provide exactly one action the user can take, with text and link. Action text should be short, but don't use just "Chat". It should be friendly and inviting.

    The most common action will be to open a chat with you - you can then help user understand the platform, ask questions, get ideas about what to do next or apply for a grant.
    
    If the action is to open a chat, do not provide a url, just set the "isChat" flag to true. The website then will open a chat in a modal when user clicks the button.

    Guidelines:
    - If the user is not logged in (guest), you may just briefly introduce the platform.
    - If the user is not a builder yet, you may suggest they apply for a grant. Would be nice to suggest 1-2 flows with smaller number of grants and that matches their interests. Applying for a grant happens via chat.
    - If the user is a builder without verified Farcaster account, suggest them to verify it. Point them to the https://warpcast.com/~/settings/verified-addresses URL.
    - If the user is a builder without recent activity (at least 5-7 days), you may suggest posting update on Farcaster. Here is the intent URL: https://warpcast.com/~/compose?text=&channelKey=[CHANNEL_ID] . For [CHANNEL_ID] use either ${NOUNS_CHANNEL_ID} or ${FLOWS_CHANNEL_ID} depending on the user's membership (use the one they already joined).
    - If the user is a builder with recent activity, be creative and suggest starting conversation with you to get ideas about what to do next and how to make the most from the platform and community. If you have some specifc ideas for the user - go with it.

    Use 2-3 short paragraphs and no more than 150 characters.
    
    Do not onboard user to web3 or crypto. Do not use any jargon, technical terms or do not refer to grants as "projects".

    Try to make the message as personalized as possible.

    Below is a general good message for new users or people who are not builders:
    "Welcome to Flows! This is were people get paid for making positive impact in their communities."

    For guests, don't be too specific about the type of builders we support. Just say it's a place for people to get paid for making positive impact in their communities.
    
    Do not introduce yourself. Do not say you have access to data about user. Just write a message to the user. No need to inform them about your context awareness or why you say what you say.
    `,
  })

  return result
}
