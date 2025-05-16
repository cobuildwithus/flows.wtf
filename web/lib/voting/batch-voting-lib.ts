import { mainnet } from "@/addresses"
import { ERC721VotingToken } from "./vote-types"

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

export const getTokenBatchAndLoadingMessage = (
  batchIndex: number,
  batchTotal: number,
  TOKENS_PER_BATCH: number,
  tokens: ERC721VotingToken[],
) => {
  const start = batchIndex * TOKENS_PER_BATCH
  const end = start + TOKENS_PER_BATCH
  const tokenBatch = tokens.slice(start, end)
  const loadingMessage =
    batchTotal > 1
      ? `Preparing vote batch ${batchIndex + 1} of ${batchTotal}...`
      : "Preparing vote..."
  return { tokenBatch, loadingMessage }
}
