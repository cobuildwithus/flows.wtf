"use server"

import database from "@/lib/database/flows-db"
import { getClient } from "@/lib/viem/client"
import { encodeAbiParameters, type Address, type Hex } from "viem"
import { getStrategies } from "./get-strategies"
import { StrategyKey } from "../strategy-key"
import { customFlowImplAbi, singleAllocatorStrategyImplAbi } from "@/lib/abis"

function ascById(a: { id: Hex }, b: { id: Hex }): number {
  const ai = BigInt(a.id)
  const bi = BigInt(b.id)
  return ai < bi ? -1 : ai > bi ? 1 : 0
}

async function getLatestTxForSingleAllocator(params: {
  flow: Address
  strat: Address
  allocator: Address
  chainId: number
  chainClient: ReturnType<typeof getClient>
}): Promise<{ tx: string; allocationKey: bigint } | null> {
  const { flow, strat, allocator, chainId, chainClient } = params
  const flowAddr = flow.toLowerCase()
  const stratAddr = strat.toLowerCase()
  const allocAddr = allocator.toLowerCase()

  // Compute allocationKey for SingleAllocator
  const key = (await chainClient.readContract({
    address: strat,
    abi: singleAllocatorStrategyImplAbi,
    functionName: "allocationKey",
    args: [allocator, "0x"],
  })) as bigint
  const keyDec = key.toString(10)

  // Prefer rows filtered by computed key
  let latest = await database.allocation.findFirst({
    where: {
      contract: flowAddr,
      strategy: stratAddr,
      allocator: allocAddr,
      chainId,
      allocationKey: keyDec,
    },
    orderBy: { blockTimestamp: "desc" },
    select: { transactionHash: true },
  })

  if (!latest) {
    latest = await database.allocation.findFirst({
      where: {
        contract: flowAddr,
        strategy: stratAddr,
        allocator: allocAddr,
        chainId,
      },
      orderBy: { blockTimestamp: "desc" },
      select: { transactionHash: true },
    })
  }

  if (!latest) return null
  return { tx: latest.transactionHash, allocationKey: key }
}

async function getLatestTxForErc721Votes(params: {
  flow: Address
  strat: Address
  allocator: Address
  chainId: number
  tokenId: bigint
}): Promise<{ tx: string } | null> {
  const { flow, strat, allocator, chainId, tokenId } = params
  const flowAddr = flow.toLowerCase()
  const stratAddr = strat.toLowerCase()
  const allocAddr = allocator.toLowerCase()
  const keyDec = tokenId.toString(10)

  const latest = await database.allocation.findFirst({
    where: {
      contract: flowAddr,
      strategy: stratAddr,
      allocator: allocAddr,
      chainId,
      allocationKey: keyDec,
    },
    orderBy: { blockTimestamp: "desc" },
    select: { transactionHash: true },
  })

  if (!latest) return null
  return { tx: latest.transactionHash }
}

async function commitIsZero(params: {
  flow: Address
  strat: Address
  chainClient: ReturnType<typeof getClient>
  allocationKey: bigint
}): Promise<boolean> {
  const { flow, strat, chainClient, allocationKey } = params
  const commit = (await chainClient.readContract({
    address: flow,
    abi: customFlowImplAbi,
    functionName: "getAllocationCommitment",
    args: [strat, allocationKey],
  })) as `0x${string}`
  const ZERO = "0x0000000000000000000000000000000000000000000000000000000000000000" as const
  return commit.toLowerCase() === ZERO
}

async function buildWitnessFromTx(params: {
  flow: Address
  strat: Address
  allocator: Address
  chainId: number
  tx: string
  allocationKey: bigint
}): Promise<Hex> {
  const { flow, strat, allocator, chainId, tx, allocationKey } = params
  const flowAddr = flow.toLowerCase()
  const stratAddr = strat.toLowerCase()
  const allocAddr = allocator.toLowerCase()
  const keyDec = allocationKey.toString(10)

  // Fetch prevWeight with explicit cast to text to avoid Prisma type conversion issues
  const weightRows = await database.$queryRaw<{ total_weight: string }[]>`
    SELECT total_weight::text AS total_weight
    FROM "onchain"."Allocation"
    WHERE contract = ${flowAddr}
      AND strategy = ${stratAddr}
      AND allocator = ${allocAddr}
      AND chain_id = ${chainId}
      AND transaction_hash = ${tx}
      AND allocation_key = ${keyDec}
    LIMIT 1
  `
  const prevWeightStr = weightRows[0]?.total_weight || "0"

  const rows = await database.allocation.findMany({
    where: {
      contract: flowAddr,
      strategy: stratAddr,
      allocator: allocAddr,
      chainId,
      transactionHash: tx,
      allocationKey: keyDec,
    },
    select: { recipientId: true, bps: true },
  })

  const pairs = rows.map((r) => ({ id: r.recipientId as Hex, bps: Number(r.bps) }))
  pairs.sort(ascById)
  const prevRecipientIds = pairs.map((p) => p.id)
  const prevBps = pairs.map((p) => p.bps)
  const prevWeight = BigInt(prevWeightStr || "0")

  return encodeAbiParameters(
    [
      { type: "uint256", name: "prevWeight" },
      { type: "bytes32[]", name: "prevRecipientIds" },
      { type: "uint32[]", name: "prevBps" },
    ],
    [prevWeight, prevRecipientIds, prevBps],
  ) as Hex
}

export async function getPrevAllocationWitnessesFromDb(params: {
  chainId: number
  flow: Address
  strategies: Address[]
  allocator: Address
  tokenIds?: Array<number | bigint>
}): Promise<{ prevAllocationWitnesses: Array<Array<Hex | null>> }> {
  const { chainId, flow, strategies, allocator, tokenIds = [] } = params
  const chainClient = getClient(chainId)
  const strategyMetas = await getStrategies(strategies, chainId)

  const prevAllocationWitnesses: Array<Array<Hex | null>> = []

  for (let i = 0; i < strategies.length; i++) {
    const strat = strategies[i]
    const meta = strategyMetas.find((m) => m.address === strat.toLowerCase())
    const key = meta?.strategyKey as StrategyKey | undefined

    if (key === StrategyKey.SingleAllocator) {
      // Single key witness
      const latest = await getLatestTxForSingleAllocator({
        flow,
        strat,
        allocator,
        chainId,
        chainClient,
      })
      if (latest) {
        const w = await buildWitnessFromTx({
          flow,
          strat,
          allocator,
          chainId,
          tx: latest.tx,
          allocationKey: latest.allocationKey,
        })
        prevAllocationWitnesses.push([w])
      } else {
        // If no DB snapshot, only return empty if on-chain commit is zero
        const allocKey = 0n
        const zero = await commitIsZero({ flow, strat, chainClient, allocationKey: allocKey })
        prevAllocationWitnesses.push([zero ? ("0x" as Hex) : null])
      }
    } else if (key === StrategyKey.ERC721Votes) {
      // One witness per provided tokenId
      const witnesses: Array<Hex | null> = []
      for (const id of tokenIds) {
        const tid = BigInt(id)
        const latest = await getLatestTxForErc721Votes({
          flow,
          strat,
          allocator,
          chainId,
          tokenId: tid,
        })
        if (latest) {
          const w = await buildWitnessFromTx({
            flow,
            strat,
            allocator,
            chainId,
            tx: latest.tx,
            allocationKey: tid,
          })
          witnesses.push(w)
        } else {
          const zero = await commitIsZero({ flow, strat, chainClient, allocationKey: tid })
          witnesses.push(zero ? ("0x" as Hex) : null)
        }
      }
      prevAllocationWitnesses.push(witnesses)
    } else {
      // Unknown strategy: return empty row
      prevAllocationWitnesses.push([])
    }
  }

  return { prevAllocationWitnesses }
}
