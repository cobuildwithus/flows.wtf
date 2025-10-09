"use client"

import { fromWei, getEthAddress } from "@/lib/utils"
import useSWR from "swr"
import { getUserGrants } from "./get-user-grants"
import { getGrantsClaimableBalance } from "./get-grants-claimable-balance"

interface GrantForEarnings {
  monthlyIncomingFlowRate: string
  flow: {
    underlyingTokenUsdPrice: string | null
  }
}

export function useUserGrants(address: string | undefined) {
  const { data: grants = [], ...rest } = useSWR(address ? `${address}_grants` : null, () =>
    getUserGrants(getEthAddress(address!)),
  )

  const { data: claimableTokens = [], mutate: refetchClaimable } = useSWR(
    address && grants.length ? [`${address}_claimable_per_grant`, grants] : null,
    () =>
      Promise.all(
        grants.map((g) =>
          getGrantsClaimableBalance(
            [{ address: g.parentContract, chainId: g.flow.chainId }],
            address!,
          ),
        ),
      ),
  )

  const aggregatedClaimable = claimableTokens.reduce((acc, val) => acc + val, 0)

  const { monthlyUsd, yearlyUsd, claimableUsd } = calculateUsdEarnings(
    grants as unknown as GrantForEarnings[],
    claimableTokens,
  )

  const monthly = grants.reduce((acc, grant) => acc + fromWei(grant.monthlyIncomingFlowRate, 18), 0)

  return {
    grants,
    refetch: () => {
      refetchClaimable()
      rest.mutate()
    },
    earnings: {
      claimable: aggregatedClaimable,
      claimableUsd,
      monthly,
      monthlyUsd,
      yearly: 12 * monthly,
      yearlyUsd,
    },
    ...rest,
  }
}

function calculateUsdEarnings(grants: GrantForEarnings[], claimableTokens: number[]) {
  const monthlyUsd = grants.reduce((acc, grant) => {
    const price = Number(grant.flow.underlyingTokenUsdPrice ?? 0)
    const tokenMonthly = fromWei(grant.monthlyIncomingFlowRate, 18)
    return acc + tokenMonthly * price
  }, 0)

  const claimableUsd = grants.reduce((acc, grant, idx) => {
    const price = Number(grant.flow.underlyingTokenUsdPrice ?? 0)
    const tokens = claimableTokens[idx] ?? 0
    return acc + (tokens / 1e18) * price
  }, 0)

  return {
    monthlyUsd,
    yearlyUsd: 12 * monthlyUsd,
    claimableUsd,
  }
}
