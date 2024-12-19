"use server"

import { Address } from "viem"
import { rewardPoolImplAbi } from "@/lib/abis"
import { l2Client } from "@/lib/viem/client"
import { unstable_cache } from "next/cache"
import { getEthAddress } from "@/lib/utils"

export const getUserTotalRewardsBalance = unstable_cache(
  async (pools: string[], address: string) => {
    try {
      const claimableBalances = await Promise.all(
        pools.map((pool) =>
          l2Client.readContract({
            address: getEthAddress(pool) as Address,
            abi: rewardPoolImplAbi,
            functionName: "getClaimableBalanceNow",
            args: [getEthAddress(address) as Address],
          }),
        ),
      )

      const memberFlowRates = await Promise.all(
        pools.map((pool) =>
          l2Client.readContract({
            address: getEthAddress(pool) as Address,
            abi: rewardPoolImplAbi,
            functionName: "getMemberFlowRate",
            args: [getEthAddress(address) as Address],
          }),
        ),
      )

      const monthly = memberFlowRates.reduce((acc, flowRate) => {
        if (typeof flowRate === "bigint") {
          // flow rate is in wei per second
          // so convert to seconds in a month
          return acc + Number(Number(flowRate) * 24 * 60 * 60 * 30) / 1e18
        }
        return acc
      }, 0)

      const claimable = claimableBalances.reduce((acc, balance) => {
        if (typeof balance === "bigint") {
          return acc + balance
        }
        return acc
      }, BigInt(0))

      return {
        earnings: {
          claimable: claimable.toString(),
          monthly,
          yearly: 12 * monthly,
        },
      }
    } catch (error) {
      console.error("Error getting rewards balances:", error)
      return {
        earnings: {
          claimable: BigInt(0).toString(),
          monthly: 0,
          yearly: 0,
        },
      }
    }
  },
  ["user-total-rewards-balance"],
  { revalidate: 600 }, // 10 minutes in seconds
)
