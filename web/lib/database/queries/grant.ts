"use server"

import { getUser } from "@/lib/auth/user"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { Status } from "@/lib/enums"
import type { Grant } from "@prisma/flows"

export async function countUserActiveGrants() {
  const user = await getUser()
  if (!user) return 0

  return database.grant.count({
    where: {
      recipient: user.address,
      isFlow: false,
      status: { in: [Status.ClearingRequested, Status.Registered, Status.RegistrationRequested] },
    },
    ...getCacheStrategy(360),
  })
}
