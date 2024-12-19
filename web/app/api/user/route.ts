// Import required dependencies
import { getUserAddressFromCookie } from "@/lib/auth/get-user-from-cookie"
import { postBuilderProfileRequest } from "@/lib/embedding/queue"
import { getFarcasterUserByEthAddress } from "@/lib/farcaster/get-user"
import { kv } from "@vercel/kv"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Configure Next.js route behavior
export const dynamic = "force-dynamic"
export const revalidate = 0
export const runtime = "nodejs"

// Expiry time in seconds (7 days)
const EXPIRY_TIME = 60 * 60 * 24 * 7

const COOKIE_NAME = "builder-profile-run"

// GET endpoint to handle user data and builder profile setup
export async function GET(request: Request) {
  try {
    // Get user's Ethereum address from cookie
    const address = await getUserAddressFromCookie()
    if (!address) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Look up associated Farcaster user
    const farcasterUser = await getFarcasterUserByEthAddress(address)

    if (farcasterUser) {
      // Check if builder profile has already been processed via cookie
      const hasRunBuilderProfile = (await cookies()).get(COOKIE_NAME)
      if (!hasRunBuilderProfile) {
        // Double check KV store to prevent duplicate processing
        const kvKey = `${COOKIE_NAME}-${address.toLowerCase()}`
        const hasRunBuilderProfileKv = await kv.get(kvKey)

        if (!hasRunBuilderProfileKv) {
          // Create and submit builder profile job
          const payload = { fid: farcasterUser.fid.toString() }
          await postBuilderProfileRequest([payload])

          const newCookies = await cookies()
          // Set cookie and KV flags to prevent reprocessing
          newCookies.set(COOKIE_NAME, "true", {
            maxAge: EXPIRY_TIME,
          })
          await kv.set(kvKey, true)
          await kv.expire(kvKey, EXPIRY_TIME)

          return NextResponse.json({ success: true, didRunBuilderProfile: true }, { status: 200 })
        }
      }
    }

    return NextResponse.json({ success: true, didRunBuilderProfile: false }, { status: 200 })
  } catch (error) {
    // Return error response if anything fails
    return NextResponse.json(
      { message: (error as Error).message || "Internal server error" },
      { status: 500 },
    )
  }
}
