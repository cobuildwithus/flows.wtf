import { createPublicClient, http } from "viem"
import { base, mainnet, optimism } from "viem/chains"

export const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`),
  batch: { multicall: true },
})

const baseClient = createPublicClient({
  chain: base,
  transport: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`),
  batch: { multicall: true },
})

const optimismClient = createPublicClient({
  chain: optimism,
  transport: http(`https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`),
  batch: { multicall: true },
})

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
