import { useMemo } from "react"
import { parseUnits } from "viem"
import { type Token } from "../libs/funding-token-lib"
import { useLogin } from "@/lib/auth/use-login"
import { useERC20Balance } from "@/lib/erc20/use-erc20-balances"
import { Grant } from "@/lib/database/types"
import { useAccount } from "wagmi"

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
  approvalNeeded: boolean
  streamingMonths: number

  flow: Pick<Grant, "superToken" | "chainId">
}

export function useFundButtonState({
  donationAmount,
  selectedToken,
  isApproving,
  isUpgrading,
  isUpdating,
  hasInsufficientBalance,
  isStreamingToken,
  approvalNeeded,
  streamingMonths,
  flow,
}: UseFundButtonStateProps) {
  const { authenticated, isConnected } = useLogin()
  const { address } = useAccount()

  const { balance: superTokenBalance } = useERC20Balance(
    flow.superToken as `0x${string}`,
    address,
    flow.chainId,
  )

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
    if (isStreamingToken) {
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
