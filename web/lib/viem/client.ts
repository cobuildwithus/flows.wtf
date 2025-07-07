import { createPublicClient, http } from "viem"
import { base, mainnet, optimism } from "viem/chains"
import { getAlchemyKey } from "../wagmi/config"

function makeClient(chain: typeof base | typeof mainnet | typeof optimism) {
  return createPublicClient({
    chain,
    transport: http(`https://eth-mainnet.g.alchemy.com/v2/${getAlchemyKey()}`),
    batch: { multicall: true },
  })
}

// Browser-safe clients
export const mainnetClient = makeClient(mainnet)
export const baseClient = makeClient(base)
export const optimismClient = makeClient(optimism)

export const getClient = (chainId: number) => {
  switch (chainId) {
    case base.id:
      return baseClient
    case mainnet.id:
      return mainnetClient
    case optimism.id:
      return optimismClient
    default:
      throw new Error(`Unsupported chainId: ${chainId}`)
  }
}

export function getChain(chainId: number) {
  switch (chainId) {
    case base.id:
      return base
    case mainnet.id:
      return mainnet
    case optimism.id:
      return optimism
    default:
      throw new Error(`Unsupported chainId: ${chainId}`)
  }
}
