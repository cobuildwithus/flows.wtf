"use server"

import { Address } from "viem"
import { nounsFlowImplAbi } from "@/lib/abis"
import { l2Client } from "@/lib/viem/client"
import { unstable_cache } from "next/cache"

export const getGrantsClaimableBalance = unstable_cache(
  async (contracts: string[], address: string) => {
    try {
      const balances = await Promise.all(
        contracts.map((contract) =>
          l2Client.readContract({
            address: contract as Address,
            abi: nounsFlowImplAbi,
            functionName: "getClaimableBalance",
            args: [address as Address],
          }),
        ),
      )

      return balances.reduce((acc, balance) => {
        if (typeof balance === "bigint") {
          return acc + Number(balance)
        }
        return acc
      }, 0)
    } catch (error) {
      console.error("Error getting claimable balances:", error)
      return 0
    }
  },
  ["grants-claimable-balance"],
  { revalidate: 600 }, // 10 minutes in seconds
)
