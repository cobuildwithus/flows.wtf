import "server-only"

import { unstable_cache } from "next/cache"
import { erc20Abi, getContract } from "viem"
import { flowTcrImplAbi } from "../abis"
import { l2Client } from "../viem/client"
import { getEthAddress } from "../utils"

export async function getTcrCosts(tcrAddress: string | null, erc20Address: string | null) {
  if (!tcrAddress || !erc20Address) return null

  return unstable_cache(
    async () => readTcrCosts(getEthAddress(tcrAddress), getEthAddress(erc20Address)),
    [`tcr-costs-${tcrAddress}-${erc20Address}`],
    { revalidate: 300 },
  )()
}

async function readTcrCosts(tcrAddress: `0x${string}`, erc20Address: `0x${string}`) {
  const tcr = getContract({ address: tcrAddress, abi: flowTcrImplAbi, client: l2Client })

  const [
    addItemCost,
    removeItemCost,
    challengeSubmissionCost,
    challengeRemovalCost,
    arbitrationCost,
  ] = await tcr.read.getTotalCosts()

  const erc20 = getContract({ address: erc20Address, abi: erc20Abi, client: l2Client })

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
