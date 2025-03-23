import { NextResponse } from "next/server"

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!
const CF_STREAM_TOKEN = process.env.CF_STREAM_TOKEN!

export async function POST(request: Request): Promise<NextResponse> {
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 })
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

    return NextResponse.json({ uploadURL, videoId: uid }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
