import { USDCx, GARDENx, USDC, GARDEN, FLOWS, FLOWSx, REV, REVx } from "../utils"
import { superTokenAbi } from "../../abis"
import type { Context } from "ponder:registry"

export interface SuperTokenInfo {
  symbol: string
  name: string
  decimals: number
  prefix: string
  logo?: string
}

const PREFIX_MAP: Record<string, string> = {
  [USDCx.toLowerCase()]: "$",
  [GARDENx.toLowerCase()]: "⚘",
  [USDC.toLowerCase()]: "$",
  [GARDEN.toLowerCase()]: "⚘",
}

const LOGO_MAP: Record<string, string> = {
  [USDCx.toLowerCase()]: "https://cdn.whisk.so/token/usdc.svg",
  [GARDENx.toLowerCase()]: "/logos/gardens.logo.png",
  [USDC.toLowerCase()]: "https://cdn.whisk.so/token/usdc.svg",
  [GARDEN.toLowerCase()]: "/logos/gardens.logo.png",
  [FLOWSx.toLowerCase()]: "/flows.png",
  [FLOWS.toLowerCase()]: "/flows.png",
  [REV.toLowerCase()]:
    "https://ipfs.banny.eth.sucks/ipfs/QmceH4kgHa9xrYW8EGbby1K7uqs9SnoahTSxByhgdqLcys",
  [REVx.toLowerCase()]:
    "https://ipfs.banny.eth.sucks/ipfs/QmceH4kgHa9xrYW8EGbby1K7uqs9SnoahTSxByhgdqLcys",
}

export async function fetchTokenInfo(
  context:
    | Context<"NounsFlow:FlowInitialized">
    | Context<"CustomFlow:FlowInitialized">
    | Context<"NounsFlowChildren:FlowInitialized">,
  tokenAddress: `0x${string}`
): Promise<SuperTokenInfo> {
  const address = tokenAddress.toLowerCase() as `0x${string}`

  const [symbol, name, decimals] = await context.client.multicall({
    contracts: [
      { address, abi: superTokenAbi, functionName: "symbol" },
      { address, abi: superTokenAbi, functionName: "name" },
      { address, abi: superTokenAbi, functionName: "decimals" },
    ],
    allowFailure: false,
  })

  const decimalNumber = Number(decimals)

  return {
    symbol,
    name,
    decimals: decimalNumber,
    prefix: PREFIX_MAP[address] ?? "",
    logo: LOGO_MAP[address],
  }
}
