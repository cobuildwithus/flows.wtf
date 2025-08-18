import React from "react"
import { formatUnits, parseUnits } from "viem"
import { type Token, validateNumericInput, getTokenBalance } from "../libs/funding-token-lib"
import { useEthBalances } from "@/app/token/hooks/use-eth-balances"

interface UseFundingInputProps {
  selectedToken: Token
  totalTokenBalance: bigint
  setDonationAmount: (amount: string) => void
}

export function useFundingInput({
  selectedToken,
  totalTokenBalance,
  setDonationAmount,
}: UseFundingInputProps) {
  const { balances: ethBalances } = useEthBalances()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxDecimals = 6
    const validatedValue = validateNumericInput(e.target.value, maxDecimals)
    setDonationAmount(validatedValue)
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      const length = e.target.value.length
      e.target.setSelectionRange(length, length)
    }, 0)
  }

  const handleMaxClick = () => {
    const balance = getTokenBalance(selectedToken, ethBalances, totalTokenBalance)

    if (selectedToken.isNative) {
      const gasReserve = parseUnits("0.001", 18)
      const maxAmount = balance > gasReserve ? balance - gasReserve : 0n
      setDonationAmount(formatUnits(maxAmount, 18))
    } else {
      setDonationAmount(formatUnits(balance, 18))
    }
  }

  return {
    handleInputChange,
    handleInputFocus,
    handleMaxClick,
  }
}
