"use client"

import { useMemo } from "react"
import { parseUnits } from "viem"

interface UseApprovalAmountProps {
  donationAmount: string
  superTokenBalance: bigint
  currentAllowance: bigint
  isNativeToken: boolean
}

export function useApprovalAmount({
  donationAmount,
  superTokenBalance,
  currentAllowance,
  isNativeToken,
}: UseApprovalAmountProps) {
  return useMemo(() => {
    // No approval needed for native tokens
    if (isNativeToken) {
      return {
        approvalNeeded: false,
        approvalAmount: 0n,
        amountNeededFromUnderlying: 0n,
      }
    }

    try {
      const donationAmountBigInt = parseUnits(donationAmount || "0", 18) // assume super token decimals is 18

      // Calculate how much we need from underlying token
      const amountNeededFromUnderlying =
        donationAmountBigInt > superTokenBalance ? donationAmountBigInt - superTokenBalance : 0n

      // Check if approval is needed
      const approvalNeeded =
        amountNeededFromUnderlying > 0n && currentAllowance < amountNeededFromUnderlying

      // Calculate the approval amount (approve exactly what's needed)
      const approvalAmount = approvalNeeded ? amountNeededFromUnderlying : 0n

      return {
        approvalNeeded,
        approvalAmount,
        amountNeededFromUnderlying,
      }
    } catch (e) {
      return {
        approvalNeeded: false,
        approvalAmount: 0n,
        amountNeededFromUnderlying: 0n,
      }
    }
  }, [donationAmount, superTokenBalance, currentAllowance, isNativeToken])
}
