import { parseUnits } from "viem"
import { type Token } from "../libs/funding-token-lib"
import { useApproveErc20 } from "./use-approve-erc20"
import { useApprovalAmount } from "./use-approval-amount"

interface UseFundingActionsProps {
  authenticated: boolean
  isConnected: boolean
  login: () => void
  connectWallet: () => void
  selectedToken: Token
  donationAmount: string
  id: string
  name: string
  chainId: number
  underlyingTokenAddress: `0x${string}`
  superTokenAddress: `0x${string}`
  superTokenBalance: bigint
  underlyingTokenBalance: bigint
  currentAllowance: bigint
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
  chainId,
  underlyingTokenAddress,
  superTokenAddress,
  superTokenBalance,
  underlyingTokenBalance,
  currentAllowance,
}: UseFundingActionsProps) {
  const { approvalNeeded, approvalAmount } = useApprovalAmount({
    donationAmount,
    tokenDecimals: selectedToken.decimals,
    superTokenBalance,
    currentAllowance,
    isNativeToken: selectedToken.isNative,
  })

  const { approve, isLoading: isApproving } = useApproveErc20({
    chainId,
    tokenAddress: underlyingTokenAddress,
    spenderAddress: superTokenAddress,
    onSuccess: (hash) => {
      console.log("Approval successful:", hash)
    },
  })

  const handleFund = async () => {
    if (!authenticated) return login()
    if (!isConnected) return connectWallet()

    const donationAmountBigInt = parseUnits(donationAmount, selectedToken.decimals)

    // Handle approval if needed
    if (approvalNeeded && approvalAmount > 0n) {
      console.log("Need approval for amount:", approvalAmount.toString())
      await approve(approvalAmount)
      return // Wait for approval to complete before funding
    } else if (!selectedToken.isNative && donationAmountBigInt > superTokenBalance) {
      console.log("Already approved sufficient amount")
    }

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
    isApproving,
  }
}
