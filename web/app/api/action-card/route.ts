import { getGuidance } from "@/app/components/action-card/get-guidance"
import { getGuidanceCacheKey } from "@/app/components/action-card/guidance-utils"
import { getUserAddressFromCookie } from "@/lib/auth/get-user-from-cookie"
import { kv } from "@vercel/kv"
import { cookies } from "next/headers"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: Request) {
  const address = await getUserAddressFromCookie()

  if (!address) {
    ;(await cookies()).set("guidance-guest", "true", { maxAge: 60 * 60 * 24 * 7 }) // 7 days
  }

  const cachedGuidance = await kv.get(getGuidanceCacheKey(address))

  if (cachedGuidance) {
    return new Response(JSON.stringify(cachedGuidance))
  }

  const result = await getGuidance(address, async (data) => {
    const key = getGuidanceCacheKey(address)
    await kv.set(key, data)
    await kv.expire(key, 60 * 60 * 4) // 4 hours
  })

  return result.toTextStreamResponse()
}
