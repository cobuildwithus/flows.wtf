import { useMemo } from "react"
import { parseUnits } from "viem"
import { type Token, getTokenBalance } from "../libs/funding-token-lib"
import { useEthBalances } from "@/app/token/hooks/use-eth-balances"

interface UseInsufficientBalanceProps {
  donationAmount: string
  selectedToken: Token
  totalTokenBalance: bigint
  isStreamingToken?: boolean
}

export function useInsufficientBalance({
  donationAmount,
  selectedToken,
  totalTokenBalance,
  isStreamingToken,
}: UseInsufficientBalanceProps) {
  const { balances: ethBalances } = useEthBalances()

  return useMemo(() => {
    if (!donationAmount || Number(donationAmount) <= 0) return false

    try {
      const donationAmountBigInt = parseUnits(donationAmount, selectedToken.decimals)

      if (selectedToken.isNative) {
        // For native tokens (ETH), check ETH balance with gas reserve
        const balance = getTokenBalance(selectedToken, ethBalances, totalTokenBalance)
        const gasReserve = parseUnits("0.01", selectedToken.decimals)
        return balance < donationAmountBigInt + gasReserve
      } else if (isStreamingToken) {
        // For streaming tokens, check if total balance (underlying + super) is sufficient
        return totalTokenBalance < donationAmountBigInt
      } else {
        // For other tokens, check the specific token balance
        const balance = getTokenBalance(selectedToken, ethBalances, totalTokenBalance)
        return balance < donationAmountBigInt
      }
    } catch {
      return false
    }
  }, [donationAmount, selectedToken, ethBalances, totalTokenBalance, isStreamingToken])
}
