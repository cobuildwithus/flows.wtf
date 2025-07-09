"use client"

import { useMemo } from "react"
import { parseUnits } from "viem"
import { Grant } from "@/lib/database/types"
import { useAccount } from "wagmi"
import { useERC20Allowance } from "@/lib/erc20/use-erc20-allowance"
import { useERC20Balance } from "@/lib/erc20/use-erc20-balances"

interface UseApprovalAmountProps {
  donationAmount: string

  flow: Pick<Grant, "underlyingERC20Token" | "superToken" | "chainId" | "underlyingTokenDecimals">
  isNativeToken: boolean
}

export function useApprovalAmount({ donationAmount, flow, isNativeToken }: UseApprovalAmountProps) {
  const { address } = useAccount()

  const { balance: superTokenBalance, refetch: refetchSuperTokenBalance } = useERC20Balance(
    flow.superToken as `0x${string}`,
    address,
    flow.chainId,
  )

  const { allowance: currentAllowance, refetch: refetchCurrentAllowance } = useERC20Allowance(
    flow.underlyingERC20Token,
    address,
    flow.superToken,
    flow.chainId,
  )

  const { approvalNeeded, approvalAmount, upgradeAmount } = useMemo(() => {
    // No approval needed for native tokens
    if (isNativeToken) {
      return {
        approvalNeeded: false,
        approvalAmount: 0n,
        upgradeAmount: 0n,
      }
    }

    try {
      const donationAmountBigInt = parseUnits(donationAmount || "0", 18) // assume super token decimals is 18

      const converted = convertSuperTokenToUnderlyingToken(
        donationAmountBigInt - superTokenBalance,
        flow.underlyingTokenDecimals,
      )

      // Calculate how much we need from underlying token
      const underlyingTokenNeeded = donationAmountBigInt > superTokenBalance ? converted : 0n

      // Check if approval is needed
      const underlyingTokenApprovalNeeded =
        underlyingTokenNeeded > 0n && currentAllowance < underlyingTokenNeeded

      // Calculate the approval amount (approve exactly what's needed)
      const underlyingTokenApprovalAmount = underlyingTokenApprovalNeeded
        ? (underlyingTokenNeeded * 102n) / 100n
        : 0n

      // upgradeTo takes the amount of supertokens you want, not the underlying token amount
      const upgradeAmount = convertUnderlyingTokenToSuperToken(
        underlyingTokenNeeded,
        flow.underlyingTokenDecimals,
      )

      return {
        approvalNeeded: underlyingTokenApprovalNeeded,
        approvalAmount: underlyingTokenApprovalAmount,
        upgradeAmount,
      }
    } catch (e) {
      return {
        approvalNeeded: false,
        approvalAmount: 0n,
        upgradeAmount: 0n,
      }
    }
  }, [donationAmount, superTokenBalance, currentAllowance, isNativeToken])

  return {
    approvalNeeded,
    approvalAmount,
    upgradeAmount,
    mutate: () => {
      refetchSuperTokenBalance()
      refetchCurrentAllowance()
    },
  }
}

const convertSuperTokenToUnderlyingToken = (
  superTokenAmount: bigint,
  underlyingTokenDecimals: number,
) => {
  // if underlying token decimals is 18, nothing happens
  // for tokens like usdc, we need to convert requested approval amount to underlying token amount by eg dividing by 10^(18-6)
  return superTokenAmount / BigInt(10 ** (18 - underlyingTokenDecimals))
}

const convertUnderlyingTokenToSuperToken = (
  underlyingTokenAmount: bigint,
  underlyingTokenDecimals: number,
) => {
  return underlyingTokenAmount * BigInt(10 ** (18 - underlyingTokenDecimals))
}
