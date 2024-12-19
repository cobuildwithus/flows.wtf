import { createConfig } from "@privy-io/wagmi"
import { webSocket } from "wagmi"
import { base, baseSepolia, Chain, mainnet } from "wagmi/chains"

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}

export const chains = [base, baseSepolia, mainnet] satisfies Chain[]

export const config = createConfig({
  chains: chains as any,
  transports: {
    [base.id]: webSocket(getRpcUrl(base, "ws")),
    [baseSepolia.id]: webSocket(getRpcUrl(baseSepolia, "ws")),
    [mainnet.id]: webSocket(getRpcUrl(mainnet, "ws")),
  },

  batch: { multicall: { wait: 32, batchSize: 2048 } },
})

export function getRpcUrl(chain: Chain, type: "http" | "ws") {
  const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID
  if (!alchemyId) throw new Error("ALCHEMY_ID is not set")

  const protocol = type === "http" ? "https" : "wss"

  switch (chain.id) {
    case base.id:
      return `${protocol}://base-mainnet.g.alchemy.com/v2/${alchemyId}`
    case baseSepolia.id:
      return `${protocol}://base-sepolia.g.alchemy.com/v2/${alchemyId}`
    case mainnet.id:
      return `${protocol}://eth-mainnet.g.alchemy.com/v2/${alchemyId}`
    default:
      throw new Error(`Unsupported chain: ${chain.id}`)
  }
}
