import { getUser } from "@/lib/auth/user"
import { postBulkIsGrantsUpdateRequest } from "@/lib/embedding/queue"
import { NextResponse } from "next/server"
import { getItem, saveItem } from "@/lib/kv/kvStore"

export const dynamic = "force-dynamic"
export const revalidate = 0

const DAILY_LIMIT = 50

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { castId, grantId } = await request.json()
    if (!castId || !grantId) {
      return NextResponse.json({ error: "Missing castId or grantId" }, { status: 400 })
    }

    // Check rate limit
    const today = new Date().toISOString().split("T")[0]
    const rateLimitKey = `grant-update-${user.address}-${today}`

    const currentCount = (await getItem<number>(rateLimitKey)) || 0

    if (currentCount >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: "Daily rate limit exceeded. Please try again tomorrow." },
        { status: 429 },
      )
    }

    await postBulkIsGrantsUpdateRequest([{ castId, grantId }])

    // Increment rate limit counter
    await saveItem(rateLimitKey, currentCount + 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in grant-update route:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 },
    )
  }
}
