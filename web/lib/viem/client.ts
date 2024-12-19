import { createPublicClient, http } from "viem"
import { base, mainnet } from "viem/chains"

export const l1Client = createPublicClient({
  chain: mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`),
  batch: { multicall: true },
})

export const l2Client = createPublicClient({
  chain: base,
  transport: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`),
  batch: { multicall: true },
})

export function getChain(chainId: number) {
  switch (chainId) {
    case base.id:
      return base
    case mainnet.id:
      return mainnet
    default:
      throw new Error(`Unsupported chainId: ${chainId}`)
  }
}
