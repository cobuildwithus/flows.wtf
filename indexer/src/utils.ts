import { http } from "viem"
import { base } from "viem/chains"
import { mainnet } from "viem/chains"

// helpful for things that we only want to run one time eg: embeddings or chain queries
export function isBlockRecent(blockTimestamp: number) {
  const FIVE_MINUTES = 5 * 60
  const currentTime = Math.floor(Date.now() / 1000)
  return currentTime - blockTimestamp < FIVE_MINUTES
}

const getPrefix = (chain: "base" | "eth" | "arbitrum" | "optimism") => {
  switch (chain) {
    case "base":
      return "base-mainnet"
    case "eth":
      return "eth-mainnet"
    case "arbitrum":
      return "arb-mainnet"
    case "optimism":
      return "opt-mainnet"
  }
}

const constructUrl = (prefix: string) =>
  http(`https://${prefix}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`)

const rpcUrl = (chain: "base" | "eth" | "arbitrum" | "optimism") => {
  const prefix = getPrefix(chain)
  return constructUrl(prefix)
}

export const getChainsAndRpcUrls = () => {
  return {
    base: {
      id: base.id,
      rpc: rpcUrl("base"),
    },
    ethereum: {
      id: mainnet.id,
      rpc: rpcUrl("eth"),
    },
  }
}
