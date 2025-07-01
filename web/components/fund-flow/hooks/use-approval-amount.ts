"use client"

import { useMemo } from "react"
import { parseUnits } from "viem"
import { Grant } from "@/lib/database/types"
import { useAccount } from "wagmi"
import { useERC20Allowance } from "@/lib/erc20/use-erc20-allowance"
import { useERC20Balance } from "@/lib/erc20/use-erc20-balances"

interface UseApprovalAmountProps {
  donationAmount: string

  flow: Pick<Grant, "underlyingERC20Token" | "superToken" | "chainId">
  isNativeToken: boolean
}

export function useApprovalAmount({ donationAmount, flow, isNativeToken }: UseApprovalAmountProps) {
  const { address } = useAccount()

  const { balance: superTokenBalance } = useERC20Balance(
    flow.superToken as `0x${string}`,
    address,
    flow.chainId,
  )

  const { allowance: currentAllowance } = useERC20Allowance(
    flow.underlyingERC20Token,
    address,
    flow.superToken,
    flow.chainId,
  )

  return useMemo(() => {
    // No approval needed for native tokens
    if (isNativeToken) {
      return {
        approvalNeeded: false,
        approvalAmount: 0n,
        needFromUnderlying: 0n,
      }
    }

    try {
      const donationAmountBigInt = parseUnits(donationAmount || "0", 18) // assume super token decimals is 18

      // Calculate how much we need from underlying token
      const needFromUnderlying =
        donationAmountBigInt > superTokenBalance ? donationAmountBigInt - superTokenBalance : 0n

      // Check if approval is needed
      const approvalNeeded = needFromUnderlying > 0n && currentAllowance < needFromUnderlying

      // Calculate the approval amount (approve exactly what's needed)
      const approvalAmount = approvalNeeded ? (needFromUnderlying * 102n) / 100n : 0n

      return {
        approvalNeeded,
        approvalAmount,
        needFromUnderlying,
      }
    } catch (e) {
      return {
        approvalNeeded: false,
        approvalAmount: 0n,
        needFromUnderlying: 0n,
      }
    }
  }, [donationAmount, superTokenBalance, currentAllowance, isNativeToken])
}
