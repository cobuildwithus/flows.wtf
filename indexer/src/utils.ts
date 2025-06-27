import { http } from "viem"
import { base, optimism } from "viem/chains"
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
    optimism: {
      id: optimism.id,
      rpc: rpcUrl("optimism"),
    },
  }
}

export const IndexerConfig = {
  CustomFlow: {
    base: {
      startBlock: 31834955,
    },
    optimism: {
      startBlock: 137560689,
    },
  },
  SuperfluidPool: {
    base: {
      startBlock: 21519031,
    },
    optimism: {
      startBlock: 137560689,
    },
  },
  GdaV1: {
    base: {
      startBlock: 21519031,
    },
    optimism: {
      startBlock: 137560689,
    },
  },
  CfaV1: {
    base: {
      startBlock: 21519031,
    },
    optimism: {
      startBlock: 137560689,
    },
  },
  TotalEarned: {
    base: {
      startBlock: "latest",
    },
    optimism: {
      startBlock: "latest",
    },
  },
} as const

export const USDCx = "0xd04383398dd2426297da660f9cca3d439af9ce1b"
export const GARDENx = "0x99E50193F4A70B2581cF3a80ae32505a4E0337fF"
export const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
export const GARDEN = "0x8b2F706cd2bc0Df6679218177c56E72C5241de9B"
