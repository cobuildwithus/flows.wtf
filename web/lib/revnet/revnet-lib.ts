import { mainnet, optimism, arbitrum, base } from "viem/chains"

export function getRevnetUrl(chainId: number, projectId: number): string {
  const chainPrefix = getChainPrefix(chainId)
  return `https://revnet.app/${chainPrefix}:${projectId}`
}

function getChainPrefix(chainId: number): string {
  switch (chainId) {
    case mainnet.id:
      return "eth"
    case optimism.id:
      return "op"
    case arbitrum.id:
      return "arb"
    case base.id:
      return "base"
    default:
      return "eth" // fallback to eth
  }
}
