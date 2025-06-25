import { parseUnits } from "viem"
import { type Token } from "../libs/funding-token-lib"

interface UseFundingActionsProps {
  authenticated: boolean
  isConnected: boolean
  login: () => void
  connectWallet: () => void
  selectedToken: Token
  donationAmount: string
  id: string
  name: string
}

export function useFundingActions({
  authenticated,
  isConnected,
  login,
  connectWallet,
  selectedToken,
  donationAmount,
  id,
  name,
}: UseFundingActionsProps) {
  const handleFund = async () => {
    if (!authenticated) return login()
    if (!isConnected) return connectWallet()

    const donationAmountBigInt = parseUnits(donationAmount, selectedToken.decimals)

    console.debug("Fund contract call", {
      flowId: id,
      name,
      amount: donationAmount,
      amountBigInt: donationAmountBigInt.toString(),
      token: selectedToken,
    })

    // TODO: Implement actual funding logic here
  }

  return {
    handleFund,
  }
}
