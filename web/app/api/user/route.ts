import { getUserAddressFromCookie } from "@/lib/auth/get-user-from-cookie"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const address = await getUserAddressFromCookie()
    if (!address) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message || "Internal server error" },
      { status: 500 },
    )
  }
}
