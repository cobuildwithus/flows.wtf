import { getUserAddressFromCookie } from "@/lib/auth/get-user-from-cookie"
import { MAX_GRANTS_PER_USER } from "@/lib/config"
import database from "@/lib/database/edge"
import { countUserActiveGrants } from "@/lib/database/queries/grant"
import { addDraftEmbedding } from "@/lib/embedding/embed-drafts"
import { tool } from "ai"
import { after } from "next/server"
import { z } from "zod"

export const submitApplication = tool({
  parameters: z.object({
    flowId: z.string(),
    title: z.string().trim(),
    description: z.string().trim(),
    image: z.string(),
    tagline: z.string().trim().max(100).optional(),
  }),
  description: "Submit the draft application for the builder you've been working with",
  execute: async ({ title, image, description, tagline, flowId }): Promise<string> => {
    const user = await getUserAddressFromCookie()
    if (!user) throw new Error("User not found")

    const userActiveGrants = await countUserActiveGrants()
    if (userActiveGrants >= MAX_GRANTS_PER_USER) {
      throw new Error(`User has reached the maximum number of active grants`)
    }
    const existingDraft = await database.draft.findFirst({
      where: {
        title,
        description,
        users: { equals: [user] },
      },
    })

    if (existingDraft) throw new Error("Draft already exists")

    const draft = await database.draft.create({
      data: {
        title,
        image,
        flowId,
        tagline,
        users: [user],
        isFlow: false,
        isPrivate: false,
        isOnchain: false,
        description,
      },
    })

    after(async () => {
      await addDraftEmbedding(draft, flowId)
    })

    return draft.id.toString()
  },
})
