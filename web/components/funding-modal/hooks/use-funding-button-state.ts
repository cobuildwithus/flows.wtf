import { useMemo } from "react"
import { parseUnits } from "viem"
import { type Token, getTokenBalance } from "../libs/funding-token-lib"

interface UseFundingButtonStateProps {
  isConnected: boolean
  authenticated: boolean
  donationAmount: string
  selectedToken: Token
  ethBalances: Record<number, bigint>
  totalTokenBalance: bigint
  isStreamingToken?: boolean
  superTokenBalance?: bigint
}

export function useFundingButtonState({
  isConnected,
  authenticated,
  donationAmount,
  selectedToken,
  ethBalances,
  totalTokenBalance,
  isStreamingToken,
  superTokenBalance,
}: UseFundingButtonStateProps) {
  return useMemo(() => {
    if (!isConnected || !authenticated) {
      return { text: "Connect wallet", disabled: false }
    }

    if (!donationAmount || Number(donationAmount) <= 0) {
      return { text: "Fund", disabled: true }
    }

    try {
      const donationAmountBigInt = parseUnits(donationAmount, selectedToken.decimals)

      let hasInsufficientBalance = false

      if (selectedToken.isNative) {
        // For native tokens (ETH), check ETH balance with gas reserve
        const balance = getTokenBalance(selectedToken, ethBalances, totalTokenBalance)
        const gasReserve = parseUnits("0.01", selectedToken.decimals)
        hasInsufficientBalance = balance < donationAmountBigInt + gasReserve
      } else if (isStreamingToken) {
        // For streaming tokens, check if total balance (underlying + super) is sufficient
        hasInsufficientBalance = totalTokenBalance < donationAmountBigInt
      } else {
        // For other tokens, check the specific token balance
        const balance = getTokenBalance(selectedToken, ethBalances, totalTokenBalance)
        hasInsufficientBalance = balance < donationAmountBigInt
      }

      if (hasInsufficientBalance) {
        return {
          text: `Insufficient ${selectedToken.symbol} balance`,
          disabled: true,
        }
      }

      // Check if approval is needed (for streaming tokens)
      if (isStreamingToken && superTokenBalance !== undefined) {
        const needsApproval = donationAmountBigInt > superTokenBalance
        if (needsApproval) {
          return {
            text: `Approve & Fund ${donationAmount} ${selectedToken.symbol}`,
            disabled: false,
          }
        }
      }
    } catch {
      return { text: "Fund", disabled: true }
    }

    return {
      text: `Fund ${donationAmount} ${selectedToken.symbol}`,
      disabled: false,
    }
  }, [
    isConnected,
    authenticated,
    donationAmount,
    selectedToken,
    ethBalances,
    totalTokenBalance,
    isStreamingToken,
    superTokenBalance,
  ])
}
