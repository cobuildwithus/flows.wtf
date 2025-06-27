import { getChain } from "@/lib/viem/client"
import { getRpcUrl } from "@/lib/wagmi/config"
import { createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"

export function getRevealVotesWalletClient(chainId: number) {
  if (!process.env.REVEAL_VOTES_PK) {
    throw new Error("REVEAL_VOTES_PK is not set in the environment variables")
  }

  const account = privateKeyToAccount(process.env.REVEAL_VOTES_PK as `0x${string}`)
  const chain = getChain(chainId)

  const client = createWalletClient({
    account,
    chain,
    transport: http(getRpcUrl(chain, "http")),
  })

  return client
}

export function getBalanceFlowRatesWalletClient(chainId: number) {
  if (!process.env.BALANCE_FLOW_RATES_PK) {
    throw new Error("BALANCE_FLOW_RATES_PK is not set in the environment variables")
  }

  const account = privateKeyToAccount(process.env.BALANCE_FLOW_RATES_PK as `0x${string}`)
  const chain = getChain(chainId)

  const client = createWalletClient({
    account,
    chain,
    transport: http(getRpcUrl(chain, "http")),
  })

  return client
}
