import { getUser } from "@/lib/auth/user"
import database from "@/lib/database/flows-db"
import { getRuleIdForFlow } from "@/lib/flows/gnars-config"
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

    const { castHash, grantId } = await request.json()
    if (!castHash || !grantId) {
      console.error("Missing castHash or grantId", { castHash, grantId })
      return NextResponse.json({ error: "Missing castHash or grantId" }, { status: 400 })
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

    // Look up the grant's flow (parentContract) to determine the rule ID
    const grant = await database.grant.findUnique({
      where: { id: grantId },
      select: { parentContract: true },
    })

    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 })
    }

    const flowId = grant.parentContract.toLowerCase()
    const ruleId = getRuleIdForFlow(flowId)

    if (!ruleId) {
      return NextResponse.json(
        { error: "Cast verification not supported for this flow" },
        { status: 400 },
      )
    }

    // Call the cast rules service
    const apiUrl = process.env.CAST_RULES_API_URL || "http://localhost:5555"
    const apiKey = process.env.CAST_RULES_API_KEY

    if (!apiKey) {
      console.error("CAST_RULES_API_KEY not configured")
      return NextResponse.json({ error: "Service not configured" }, { status: 500 })
    }

    const response = await fetch(`${apiUrl}/v1/casts/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ hash: castHash, rule: ruleId }),
    })

    const result = await response.json()
    console.log("result", result)

    if (!response.ok) {
      console.error("Cast rules API error:", result)
      return NextResponse.json(
        { error: result.outcomeReason || "Failed to verify cast" },
        { status: response.status },
      )
    }

    // Increment rate limit counter
    await saveItem(rateLimitKey, currentCount + 1)

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("Error in grant-update route:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 },
    )
  }
}
