"use server"

import { revalidateTag } from "next/cache"

export async function revalidateRewardsCache() {
  revalidateTag("user-total-rewards-balance")
}
