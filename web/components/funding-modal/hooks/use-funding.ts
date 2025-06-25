import { useMemo } from "react"
import { parseUnits } from "viem"
import { type Token, getTokenBalance } from "../libs/funding-token-lib"
import { useLogin } from "@/lib/auth/use-login"
import { useEthBalances } from "@/app/token/hooks/use-eth-balances"
import { useERC20Balances } from "@/lib/erc20/use-erc20-balances"
import { useERC20Allowance } from "@/lib/erc20/use-erc20-allowance"
import { useApproveErc20 } from "@/lib/erc20/use-approve-erc20"
import { useApprovalAmount } from "./use-approval-amount"
import { useUpgradeToken } from "@/lib/erc20/super-token/use-upgrade-token"
import { Grant } from "@/lib/database/types"

interface UseFundingProps {
  selectedToken: Token
  donationAmount: string
  flow: Pick<Grant, "id" | "title" | "chainId" | "underlyingERC20Token" | "superToken">
  totalTokenBalance: bigint
  superTokenBalance?: bigint
  isStreamingToken?: boolean
}

export function useFunding({
  selectedToken,
  donationAmount,
  flow,
  totalTokenBalance,
  superTokenBalance: externalSuperTokenBalance,
  isStreamingToken,
}: UseFundingProps) {
  const { authenticated, isConnected, login, connectWallet, address } = useLogin()
  const { balances: ethBalances } = useEthBalances()

  // Fetch token balances if not provided
  const { balances } = useERC20Balances(
    [flow.underlyingERC20Token as `0x${string}`, flow.superToken as `0x${string}`],
    address,
    flow.chainId,
  )
  const superTokenBalance = externalSuperTokenBalance ?? balances[1] ?? 0n

  // Check allowance
  const { allowance: currentAllowance } = useERC20Allowance(
    flow.underlyingERC20Token,
    address,
    flow.superToken,
    flow.chainId,
  )

  const { approvalNeeded, approvalAmount, amountNeededFromUnderlying } = useApprovalAmount({
    donationAmount,
    tokenDecimals: selectedToken.decimals,
    superTokenBalance,
    currentAllowance,
    isNativeToken: selectedToken.isNative,
  })

  const { approve, isLoading: isApproving } = useApproveErc20({
    chainId: flow.chainId,
    tokenAddress: flow.underlyingERC20Token as `0x${string}`,
    spenderAddress: flow.superToken as `0x${string}`,
    onSuccess: (hash: string) => {
      console.log("Approval successful:", hash)
    },
  })

  const { upgrade, isLoading: isUpgrading } = useUpgradeToken({
    chainId: flow.chainId,
    superTokenAddress: flow.superToken as `0x${string}`,
    onSuccess: (hash: string) => {
      console.log("Upgrade successful:", hash)
    },
  })

  // Button state logic
  const buttonState = useMemo(() => {
    // Handle loading states first
    if (isApproving) {
      return { text: "Approving...", disabled: true }
    }

    if (isUpgrading) {
      return { text: "Upgrading...", disabled: true }
    }

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
          const amountNeededFromUnderlying = donationAmountBigInt - superTokenBalance
          const needsUpgrade = amountNeededFromUnderlying > 0n

          if (needsUpgrade) {
            return {
              text: `Upgrade & Fund ${donationAmount} ${selectedToken.symbol}`,
              disabled: false,
            }
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
    isApproving,
    isUpgrading,
  ])

  const handleFund = async () => {
    if (!authenticated) return login()
    if (!isConnected) return connectWallet()

    const donationAmountBigInt = parseUnits(donationAmount, selectedToken.decimals)

    // Step 1: Handle approval if needed
    if (approvalNeeded && approvalAmount > 0n) {
      console.log("Need approval for amount:", approvalAmount.toString())
      await approve(approvalAmount)
      return // Wait for approval to complete before continuing
    }

    // Step 2: Handle upgrade if needed (only for non-native tokens)
    if (!selectedToken.isNative && amountNeededFromUnderlying > 0n) {
      console.log("Need to upgrade amount:", amountNeededFromUnderlying.toString())
      await upgrade(amountNeededFromUnderlying)
      return // Wait for upgrade to complete before funding
    }

    // Step 3: Execute the actual funding
    console.debug("Fund contract call", {
      flowId: flow.id,
      flowName: flow.title,
      amount: donationAmount,
      amountBigInt: donationAmountBigInt.toString(),
      token: selectedToken,
    })

    // TODO: Implement actual funding logic here
  }

  return {
    // Button state
    buttonText: buttonState.text,
    isDisabled: buttonState.disabled,

    // Actions
    handleFund,
  }
}
