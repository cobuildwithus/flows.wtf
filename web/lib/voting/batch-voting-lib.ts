import { mainnet } from "@/addresses"

export const getTokensPerBatch = (tokenContract: string | null) => {
  if (!tokenContract) return 1e3

  // Since NounsFlow requires posting proofs onchain, we limit the number of tokens per batch
  // to 15 to avoid hitting the gas limit.
  if (tokenContract === mainnet.NounsToken) {
    return 15
  }

  return 1e3
}

export const getNumBatches = (numTokens: number, tokensPerBatch: number) => {
  return Math.max(1, Math.ceil(numTokens / tokensPerBatch))
}
