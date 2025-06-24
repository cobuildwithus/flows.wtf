"use client"

import { getEthAddress } from "@/lib/utils"
import useSWR from "swr"
import { getUserTcrTokens } from "./get-user-tcr-tokens"
import { getUserTotalRewardsBalance } from "./get-user-total-rewards-balance"
import { revalidateRewardsCache } from "./revalidate-rewards-cache"

export function useUserTcrTokens(address: string | undefined) {
  const { data, ...rest } = useSWR(address ? `${address}_tcr_tokens` : null, () =>
    getUserTcrTokens(getEthAddress(address!!)),
  )

  const { data: earningsData, mutate } = useSWR(
    address && data?.length ? [`${address}_total_rewards`, data] : null,
    () =>
      getUserTotalRewardsBalance(
        data?.map((token) => token.flow.managerRewardPool) || [],
        address!,
        data?.map((token) => token.flow.chainId)?.[0],
      ),
  )

  return {
    earnings: earningsData?.earnings || { claimable: 0, monthly: 0, yearly: 0 },
    tokens: data || [],
    totalBalance: data?.reduce((acc, token) => acc + BigInt(token.amount), BigInt(0)),
    mutateEarnings: async () => {
      await revalidateRewardsCache()
      setTimeout(mutate, 1500)
    },
    ...rest,
  }
}
