import "server-only"

import { unstable_cache } from "next/cache"
import { erc20Abi, getContract } from "viem"
import { flowTcrImplAbi } from "../abis"
import { getClient } from "../viem/client"
import { getEthAddress } from "../utils"

export async function getTcrCosts(
  tcrAddress: string | null,
  erc20Address: string | null,
  chainId: number,
) {
  if (!tcrAddress || !erc20Address) return null

  return unstable_cache(
    async () => readTcrCosts(getEthAddress(tcrAddress), getEthAddress(erc20Address), chainId),
    [`tcr-costs-${tcrAddress}-${erc20Address}`],
    { revalidate: 300 },
  )()
}

async function readTcrCosts(
  tcrAddress: `0x${string}`,
  erc20Address: `0x${string}`,
  chainId: number,
) {
  const client = getClient(chainId)
  const tcr = getContract({
    address: tcrAddress,
    abi: flowTcrImplAbi,
    client,
  })

  const [
    addItemCost,
    removeItemCost,
    challengeSubmissionCost,
    challengeRemovalCost,
    arbitrationCost,
  ] = await tcr.read.getTotalCosts()

  const erc20 = getContract({
    address: erc20Address,
    abi: erc20Abi,
    client,
  })

  const symbol = await erc20.read.symbol()

  return {
    addItemCost: addItemCost.toString(),
    removeItemCost: removeItemCost.toString(),
    challengeSubmissionCost: challengeSubmissionCost.toString(),
    challengeRemovalCost: challengeRemovalCost.toString(),
    arbitrationCost: arbitrationCost.toString(),
    symbol,
  }
}
