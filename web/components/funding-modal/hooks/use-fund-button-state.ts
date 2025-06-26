import { useMemo } from "react"
import { parseUnits } from "viem"
import { type Token } from "../libs/funding-token-lib"
import { useLogin } from "@/lib/auth/use-login"

interface UseFundButtonStateProps {
  // Input state
  donationAmount: string
  selectedToken: Token

  // Loading states
  isApproving: boolean
  isUpgrading: boolean
  isUpdating: boolean

  // Balance and approval state
  hasInsufficientBalance: boolean
  isStreamingToken?: boolean
  superTokenBalance?: bigint
  approvalNeeded: boolean
}

export function useFundButtonState({
  donationAmount,
  selectedToken,
  isApproving,
  isUpgrading,
  isUpdating,
  hasInsufficientBalance,
  isStreamingToken,
  superTokenBalance,
  approvalNeeded,
}: UseFundButtonStateProps) {
  const { authenticated, isConnected } = useLogin()

  return useMemo(() => {
    // Handle loading states first
    if (isApproving) {
      return { text: "Approving...", disabled: true }
    }

    if (isUpgrading || isUpdating) {
      return { text: "Funding...", disabled: true }
    }

    // Authentication checks
    if (!isConnected || !authenticated) {
      return { text: "Connect wallet", disabled: false }
    }

    // Input validation
    if (!donationAmount || Number(donationAmount) <= 0) {
      return { text: "Fund", disabled: true }
    }

    // Balance checks
    if (hasInsufficientBalance) {
      return {
        text: `Insufficient ${selectedToken.symbol} balance`,
        disabled: true,
      }
    }

    // Approval checks for streaming tokens
    if (isStreamingToken && superTokenBalance !== undefined) {
      try {
        const donationAmountBigInt = parseUnits(donationAmount, selectedToken.decimals)
        const needsApproval = donationAmountBigInt > superTokenBalance

        if (needsApproval && approvalNeeded) {
          return {
            text: `Approve & Fund ${donationAmount} ${selectedToken.symbol}`,
            disabled: false,
          }
        }
      } catch {
        return { text: "Fund", disabled: true }
      }
    }

    // Default successful state
    return {
      text: `Fund ${donationAmount} ${selectedToken.symbol}`,
      disabled: false,
    }
  }, [
    isConnected,
    authenticated,
    donationAmount,
    selectedToken,
    isApproving,
    isUpgrading,
    isUpdating,
    hasInsufficientBalance,
    isStreamingToken,
    superTokenBalance,
    approvalNeeded,
  ])
}
