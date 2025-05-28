import { getUser } from "@/lib/auth/user"
import { NextResponse } from "next/server"
import { getItem, saveItem } from "@/lib/kv/kvStore"
import database from "@/lib/database/flows-db"
import { isAdmin } from "@/lib/database/helpers"

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID
const CF_STREAM_TOKEN = process.env.CF_STREAM_TOKEN
const BUILDER_DAILY_LIMIT = 100
const DAILY_LIMIT = 5

export async function POST(request: Request): Promise<NextResponse> {
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 })
  }

  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const grantsCount = await database.grant.count({
    where: {
      recipient: user.address,
      isFlow: false,
      isRemoved: false,
    },
  })
  const isGrantsBuilder = grantsCount > 0

  const dailyLimit = isGrantsBuilder || isAdmin(user.address) ? BUILDER_DAILY_LIMIT : DAILY_LIMIT

  const today = new Date().toISOString().split("T")[0]
  const rateLimitKey = `cloudflare-upload-${user.address}-${today}`

  const currentCount = (await getItem<number>(rateLimitKey)) || 0

  if (currentCount >= dailyLimit) {
    return NextResponse.json(
      { error: "Daily rate limit exceeded. Please try again tomorrow." },
      { status: 429 },
    )
  }

  try {
    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_STREAM_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ maxDurationSeconds: 3600 }),
      },
    )

    const data = await cfRes.json()

    if (!data.success) {
      console.error("Cloudflare API error:", data.errors)
      return NextResponse.json({ error: "Cloudflare upload URL creation failed" }, { status: 500 })
    }

    const { uploadURL, uid } = data.result

    await saveItem(rateLimitKey, currentCount + 1)

    return NextResponse.json({ uploadURL, videoId: uid }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
