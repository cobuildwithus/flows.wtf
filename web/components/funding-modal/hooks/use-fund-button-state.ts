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
  streamingMonths: number
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
  streamingMonths,
}: UseFundButtonStateProps) {
  const { authenticated, isConnected } = useLogin()

  return useMemo(() => {
    // Calculate monthly amount for display
    const calculateMonthlyAmount = () => {
      try {
        const totalAmount = parseFloat(donationAmount)
        if (!isNaN(totalAmount) && totalAmount > 0) {
          const monthlyAmount = totalAmount / streamingMonths
          // Format to 2 decimal places, removing trailing zeros
          return parseFloat(monthlyAmount.toFixed(2)).toString()
        }
      } catch {}
      return "0"
    }

    const monthlyAmount = calculateMonthlyAmount()

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
            text: `Approve & Fund ${monthlyAmount} ${selectedToken.symbol}/mo`,
            disabled: false,
          }
        }
      } catch {
        return { text: "Fund", disabled: true }
      }
    }

    // Default successful state
    return {
      text: `Fund ${monthlyAmount} ${selectedToken.symbol}/mo`,
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
    streamingMonths,
  ])
}
