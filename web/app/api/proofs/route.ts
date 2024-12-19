import { getUserAddressFromCookie } from "@/lib/auth/get-user-from-cookie"
import { serialize } from "@/lib/serialize"
import { generateOwnerProofs } from "@/lib/voting/owner-proofs/proofs"
import { NextResponse } from "next/server"
import { Address } from "viem"

export const maxDuration = 30

interface Body {
  tokens: { id: bigint; owner: Address }[]
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json()
    // Get user's Ethereum address from cookie
    const address = await getUserAddressFromCookie()
    if (!address) {
      throw new Error("No user found")
    }

    if (!body.tokens.length) {
      throw new Error("No tokens provided")
    }

    const tokens = body.tokens.map(({ id, owner }) => ({ id: BigInt(id), owner }))
    const proofs = await generateOwnerProofs(tokens)

    return NextResponse.json(serialize(proofs))
  } catch (error) {
    console.error(error)
    // Return error response if anything fails
    return NextResponse.json(
      { message: (error as Error).message || "Internal server error" },
      { status: 500 },
    )
  }
}
