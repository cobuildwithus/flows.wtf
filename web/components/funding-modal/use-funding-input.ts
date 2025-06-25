import React from "react"
import { formatUnits, parseUnits } from "viem"
import { type Token, validateNumericInput, getTokenBalance } from "./funding-token-lib"

interface UseFundingInputProps {
  selectedToken: Token
  ethBalances: Record<number, bigint>
  streamingTokenBalance: bigint
  donationAmount: string
  setDonationAmount: (amount: string) => void
}

export function useFundingInput({
  selectedToken,
  ethBalances,
  streamingTokenBalance,
  donationAmount,
  setDonationAmount,
}: UseFundingInputProps) {
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
    const balance = getTokenBalance(selectedToken, ethBalances, streamingTokenBalance)

    if (selectedToken.isNative) {
      const gasReserve = parseUnits("0.01", selectedToken.decimals)
      const maxAmount = balance > gasReserve ? balance - gasReserve : 0n
      setDonationAmount(formatUnits(maxAmount, selectedToken.decimals))
    } else {
      setDonationAmount(formatUnits(balance, selectedToken.decimals))
    }
  }

  return {
    handleInputChange,
    handleInputFocus,
    handleMaxClick,
  }
}
