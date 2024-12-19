import useSWR from "swr"
import { fetchDelegatedTokens } from "./get-delegated-tokens"

export function useDelegatedTokens(address: `0x${string}` | undefined) {
  const { data, ...rest } = useSWR(
    address,
    (address) => fetchDelegatedTokens(address.toLowerCase()),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  return {
    tokens: data?.map(({ id, owner }) => ({ id: BigInt(id), owner })) || [],
    ...rest,
  }
}
