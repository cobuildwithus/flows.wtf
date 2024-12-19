import useSWR from "swr"
import { useDelegatedTokens } from "../delegated-tokens/use-delegated-tokens"
import { getTokenVotes } from "./get-token-votes"

export function useUserVotes(contract: `0x${string}`, address: string | undefined) {
  const { tokens } = useDelegatedTokens(address as `0x${string}`)

  const tokenIds = tokens.map(({ id }) => id.toString())

  const { data, ...rest } = useSWR(tokens.length > 0 ? `${contract}_${tokenIds}` : null, () =>
    getTokenVotes(contract, tokenIds),
  )

  return {
    votes: data || [],
    ...rest,
  }
}
