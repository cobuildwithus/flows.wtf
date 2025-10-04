import { NextResponse } from "next/server"
import { getPrevAllocationWitnessesFromDb } from "@/lib/allocation/allocation-data/prev-witness-from-db"
import { buildAllocationData } from "@/lib/allocation/allocation-data/build-data"

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { chainId, flow, strategies, allocator, tokenIds } = body as {
      chainId: number
      flow: `0x${string}`
      strategies: `0x${string}`[]
      allocator: `0x${string}`
      tokenIds?: Array<number | string>
    }

    if (!chainId || !flow || !Array.isArray(strategies) || !allocator) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 })
    }

    const parsedTokenIdsBig = (tokenIds || []).map((x) => BigInt(x))
    const parsedTokenIdsNum = (tokenIds || []).map((x) => Number(x))

    const { prevAllocationWitnesses } = await getPrevAllocationWitnessesFromDb({
      chainId,
      flow,
      strategies,
      allocator,
      tokenIds: parsedTokenIdsBig,
    })

    const { allocationData } = await buildAllocationData(strategies, chainId, parsedTokenIdsNum)
    return NextResponse.json({ prevAllocationWitnesses, allocationData }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
