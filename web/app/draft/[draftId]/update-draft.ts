"use server"

import database from "@/lib/database/edge"
import { updateDraftEmbedding } from "@/lib/embedding/embed-drafts"
import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { z } from "zod"

const schema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description (Markdown) is required"),
})

export async function updateDraft(id: number, formData: FormData, user?: `0x${string}`) {
  try {
    const draft = await database.draft.findUnique({ where: { id, isOnchain: false } })
    if (!draft) throw new Error("Draft not found")

    if (!draft.users.some((address) => address.toLowerCase() === user?.toLowerCase())) {
      throw new Error("Failed to update draft")
    }

    const validation = schema.safeParse(Object.fromEntries(formData))

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      console.error(errors)
      throw new Error(Object.values(errors).flat().join(", "))
    }

    const newDraft = await database.draft.update({
      where: { id, isOnchain: false },
      data: validation.data,
    })

    after(async () => {
      await updateDraftEmbedding(draft, newDraft, draft.flowId)
    })

    revalidatePath(`/draft/${id}`)

    return { error: false }
  } catch (error) {
    return { error: (error as Error).message || "Failed to save draft" }
  }
}
