"use server"

import database from "@/lib/database/edge"

import { getCacheStrategy } from "@/lib/database/edge"

export async function getGrantById(grantId: string) {
  if (!grantId) return null

  return database.grant.findUnique({
    where: { id: grantId },
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
    },
    ...getCacheStrategy(360),
  })
}
