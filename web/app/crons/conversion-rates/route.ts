import "server-only"
import { NextResponse } from "next/server"
import { fetchAndSetEthRates } from "@/app/token/ethPrice"

export const dynamic = "force-dynamic"
export const maxDuration = 300

export async function GET() {
  try {
    await fetchAndSetEthRates()
    return NextResponse.json({ success: true, message: "Conversion rates updated successfully" })
  } catch (error: any) {
    console.error("Error updating conversion rates:", error)
    return new Response(error.message, { status: 500 })
  }
}
