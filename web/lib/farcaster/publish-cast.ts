"use server"

import { createHash } from "crypto"

export type NewCastData = {
  text: string
  embeds?: { url: string }[]
  parent: string
  channel_id?: string
}

function generateIdem(message: string): string {
  return createHash("sha256")
    .update(message + new Date().toISOString().split("T")[0])
    .digest("hex")
}

export async function publishCast(signer_uuid: string, cast: NewCastData) {
  const response = await fetch("https://api.neynar.com/v2/farcaster/cast", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": process.env.NEYNAR_API_KEY as string,
    },
    body: JSON.stringify({ signer_uuid, idem: generateIdem(cast.text), ...cast }),
  })

  if (!response.ok) {
    console.debug(JSON.stringify({ cast }, null, 2))
    const error = await response.json()
    throw new Error(`Failed to publish cast: ${error.message}`)
  }

  const result = await response.json()

  if (!result.success) {
    throw new Error(`Failed to publish cast`)
  }

  return result as {
    success: boolean
    cast: {
      hash: string
      text: string
      author: { fid: number }
    }
  }
}
