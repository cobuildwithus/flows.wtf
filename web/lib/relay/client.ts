import {
  MAINNET_RELAY_API,
  TESTNET_RELAY_API,
  convertViemChainToRelayChain,
  createClient,
} from "@reservoir0x/relay-sdk"
import { Chain, base, baseSepolia, mainnet } from "viem/chains"

export function createRelayClient(chainId: number) {
  const isTestnet = [baseSepolia.id].includes(chainId as any)

  /// @notice UI components only support mainnet and base
  const chains: Chain[] = [mainnet, base]

  if (isTestnet) {
    chains.push(baseSepolia)
  }

  return createClient({
    baseApiUrl: isTestnet ? TESTNET_RELAY_API : MAINNET_RELAY_API,
    source: "flows.wtf",
    chains: chains.map((chain) => convertViemChainToRelayChain(chain)),
  })
}
