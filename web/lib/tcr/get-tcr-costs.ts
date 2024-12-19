import "server-only"

import { Grant } from "@prisma/flows"
import { unstable_cache } from "next/cache"
import { erc20Abi, getContract } from "viem"
import { flowTcrImplAbi } from "../abis"
import { getEthAddress } from "../utils"
import { l2Client } from "../viem/client"

export async function getTcrCosts(flow: Grant) {
  return unstable_cache(
    async () => readTcrCosts(getEthAddress(flow.tcr), getEthAddress(flow.erc20)),
    [`tcr-costs-${flow.tcr}-${flow.erc20}`],
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
