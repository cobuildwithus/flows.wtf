import { createConfig } from "@privy-io/wagmi"
import { http } from "viem"
import { base, baseSepolia, Chain, mainnet, optimism } from "wagmi/chains"

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}

export const chains = [base, baseSepolia, mainnet, optimism] satisfies Chain[]

export const config = createConfig({
  chains: chains as any,
  transports: {
    [base.id]: http(getRpcUrl(base, "http")),
    [baseSepolia.id]: http(getRpcUrl(baseSepolia, "http")),
    [mainnet.id]: http(getRpcUrl(mainnet, "http")),
    [optimism.id]: http(getRpcUrl(optimism, "http")),
  },

  batch: { multicall: { wait: 32, batchSize: 2048 } },
})

/** Returns the proper Alchemy key for the current runtime. */
export function getAlchemyKey() {
  // Runs at *runtime*, so the secret never lands in the JS bundle.
  return typeof window === "undefined"
    ? process.env.ALCHEMY_ID_SERVERSIDE
    : process.env.NEXT_PUBLIC_ALCHEMY_ID
}

export function getRpcUrl(chain: Chain, type: "http" | "ws") {
  const alchemyId = getAlchemyKey()
  if (!alchemyId) throw new Error("Missing Alchemy env var")

  const protocol = type === "http" ? "https" : "wss"

  switch (chain.id) {
    case base.id:
      return `${protocol}://base-mainnet.g.alchemy.com/v2/${alchemyId}`
    case baseSepolia.id:
      return `${protocol}://base-sepolia.g.alchemy.com/v2/${alchemyId}`
    case mainnet.id:
      return `${protocol}://eth-mainnet.g.alchemy.com/v2/${alchemyId}`
    case optimism.id:
      return `${protocol}://opt-mainnet.g.alchemy.com/v2/${alchemyId}`
    default:
      throw new Error(`Unsupported chain: ${chain.id}`)
  }
}
