"use client"

import { getEthAddress } from "@/lib/utils"
import useSWR from "swr"
import { getUserGrants } from "./get-user-grants"
import { getGrantsClaimableBalance } from "./get-grants-claimable-balance"

export function useUserGrants(address: string | undefined) {
  const { data: grants = [], ...rest } = useSWR(address ? `${address}_grants` : null, () =>
    getUserGrants(getEthAddress(address!)),
  )

  const { data: claimableBalance, mutate: refetchClaimable } = useSWR(
    address && grants.length ? [`${address}_claimable_balance`, grants] : null,
    () =>
      getGrantsClaimableBalance(
        grants.map((g) => g.parentContract),
        address!,
      ),
  )

  const monthly = grants.reduce((acc, grant) => acc + Number(grant.monthlyIncomingFlowRate), 0)

  return {
    grants,
    refetch: () => {
      refetchClaimable()
      rest.mutate()
    },
    earnings: {
      claimable: claimableBalance,
      monthly,
      yearly: 12 * monthly,
    },
    ...rest,
  }
}
