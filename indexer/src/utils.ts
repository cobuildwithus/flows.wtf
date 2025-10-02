import { http, webSocket } from "viem"
import { base, optimism } from "viem/chains"
import { mainnet } from "viem/chains"

// helpful for things that we only want to run one time eg: embeddings or chain queries
export function isBlockRecent(blockTimestamp: number | bigint) {
  const FIVE_MINUTES = 5 * 60
  const currentTime = Math.floor(Date.now() / 1000)
  const ts = typeof blockTimestamp === "bigint" ? Number(blockTimestamp) : blockTimestamp
  return currentTime - ts < FIVE_MINUTES
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

const createAlchemyUrl = (
  chain: "base" | "eth" | "arbitrum" | "optimism",
  protocol: "https" | "wss"
) => {
  const prefix = getPrefix(chain)
  const baseUrl = `${prefix}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`

  if (protocol === "https") {
    return `https://${baseUrl}`
  } else {
    return `wss://${baseUrl}`
  }
}

export const getChainsAndRpcUrls = () => {
  return {
    base: {
      id: base.id,
      rpc: createAlchemyUrl("base", "https"),
      ws: createAlchemyUrl("base", "wss"),
    },
    ethereum: {
      id: mainnet.id,
      rpc: createAlchemyUrl("eth", "https"),
      ws: createAlchemyUrl("eth", "wss"),
    },
    optimism: {
      id: optimism.id,
      rpc: createAlchemyUrl("optimism", "https"),
      ws: createAlchemyUrl("optimism", "wss"),
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
  LatestBlockCron: {
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
export const FLOWS = "0xa66c1faefd257dbe9da50e56c7816b5710c9e2a1"
export const FLOWSx = "0x5edbd3756ba7f6f1d7486c838c6f003712dd1bf4"

export const REV = "0x7928b48ce30aee1c5cde302769418b9e4515edcc"
export const REVx = "0x7fc017037f23D553C7aD58d0d6273949B7194509"

export const STREAMING_TOKENS = [USDCx, GARDENx, FLOWSx, REVx] as `0x${string}`[]
