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
}

export function useFundingButtonState({
  isConnected,
  authenticated,
  donationAmount,
  selectedToken,
  ethBalances,
  totalTokenBalance,
}: UseFundingButtonStateProps) {
  return useMemo(() => {
    if (!isConnected || !authenticated) {
      return { text: "Connect wallet", disabled: false }
    }

    if (!donationAmount || Number(donationAmount) <= 0) {
      return { text: "Fund", disabled: true }
    }

    try {
      const balance = getTokenBalance(selectedToken, ethBalances, totalTokenBalance)
      const donationAmountBigInt = parseUnits(donationAmount, selectedToken.decimals)

      let hasInsufficientBalance = false

      if (selectedToken.isNative) {
        const gasReserve = parseUnits("0.01", selectedToken.decimals)
        hasInsufficientBalance = balance < donationAmountBigInt + gasReserve
      } else {
        hasInsufficientBalance = balance < donationAmountBigInt
      }

      if (hasInsufficientBalance) {
        return {
          text: `Insufficient ${selectedToken.symbol} balance`,
          disabled: true,
        }
      }
    } catch {
      return { text: "Fund", disabled: true }
    }

    return {
      text: `Fund ${donationAmount} ${selectedToken.symbol}`,
      disabled: false,
    }
  }, [isConnected, authenticated, donationAmount, selectedToken, ethBalances, totalTokenBalance])
}
