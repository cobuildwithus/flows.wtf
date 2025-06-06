"use server"

import { getUser } from "@/lib/auth/user"
import database from "@/lib/database/flows-db"
import { Status } from "@/lib/enums"

export async function countUserActiveGrants() {
  const user = await getUser()
  if (!user) return 0

  return database.grant.count({
    where: {
      recipient: user.address,
      isFlow: false,
      status: { in: [Status.ClearingRequested, Status.Registered, Status.RegistrationRequested] },
      monthlyIncomingBaselineFlowRate: { not: "0" },
    },
  })
}
