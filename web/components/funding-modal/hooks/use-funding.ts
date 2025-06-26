import { useMemo } from "react"
import { parseUnits } from "viem"
import { type Token, getTokenBalance } from "../libs/funding-token-lib"
import { useLogin } from "@/lib/auth/use-login"
import { useEthBalances } from "@/app/token/hooks/use-eth-balances"
import { useERC20Balances } from "@/lib/erc20/use-erc20-balances"
import { useERC20Allowance } from "@/lib/erc20/use-erc20-allowance"
import { useApproveErc20 } from "@/lib/erc20/use-approve-erc20"
import { useApprovalAmount } from "./use-approval-amount"
import { useUpgradeAndCreateFlow } from "@/lib/erc20/super-token/use-upgrade-create-flow"
import { Grant } from "@/lib/database/types"

interface UseFundingProps {
  selectedToken: Token
  donationAmount: string
  flow: Pick<Grant, "id" | "title" | "chainId" | "underlyingERC20Token" | "superToken">
  totalTokenBalance: bigint
  superTokenBalance?: bigint
  isStreamingToken?: boolean
  streamingMonths: number
}

export function useFunding({
  selectedToken,
  donationAmount,
  flow,
  totalTokenBalance,
  superTokenBalance: externalSuperTokenBalance,
  isStreamingToken,
  streamingMonths,
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

  const { createFlow, isLoading: isUpgrading } = useUpgradeAndCreateFlow({
    chainId: flow.chainId,
    superTokenAddress: flow.superToken as `0x${string}`,
    onSuccess: (hash: string) => {
      console.log("Upgrade successful:", hash)
    },
  })

  // Track if balance is insufficient
  const hasInsufficientBalance = useMemo(() => {
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

  // Button state logic
  const buttonState = useMemo(() => {
    // Handle loading states first
    if (isApproving) {
      return { text: "Approving...", disabled: true }
    }

    if (isUpgrading) {
      return { text: "Funding...", disabled: true }
    }

    if (!isConnected || !authenticated) {
      return { text: "Connect wallet", disabled: false }
    }

    if (!donationAmount || Number(donationAmount) <= 0) {
      return { text: "Fund", disabled: true }
    }

    if (hasInsufficientBalance) {
      return {
        text: `Insufficient ${selectedToken.symbol} balance`,
        disabled: true,
      }
    }

    try {
      const donationAmountBigInt = parseUnits(donationAmount, selectedToken.decimals)

      // Check if approval is needed (for streaming tokens)
      if (isStreamingToken && superTokenBalance !== undefined) {
        const needsApproval = donationAmountBigInt > superTokenBalance
        if (needsApproval && approvalNeeded) {
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
    isStreamingToken,
    superTokenBalance,
    isApproving,
    isUpgrading,
    hasInsufficientBalance,
    approvalNeeded,
  ])

  const handleFund = async () => {
    if (!authenticated) return login()
    if (!isConnected) return connectWallet()

    const donationAmountBigInt = parseUnits(donationAmount, selectedToken.decimals)

    // Calculate monthly flow rate based on streaming months
    const monthlyFlowRate = donationAmountBigInt / BigInt(streamingMonths)

    // For streaming tokens, handle approval and upgrade in batch
    if (isStreamingToken && superTokenBalance !== undefined) {
      // Step 1: Handle approval if needed
      if (approvalNeeded && approvalAmount > 0n) {
        console.log("Need approval for amount:", approvalAmount.toString())
        await approve(approvalAmount)
        return // Wait for approval to complete before continuing
      }
    }

    // Use the batch operation to upgrade tokens and create flow in one transaction
    await createFlow(
      amountNeededFromUnderlying,
      flow.id as `0x${string}`, // Flow ID is the receiver address
      monthlyFlowRate,
    )

    // For native tokens or when no upgrade is needed
    console.debug("Fund contract call", {
      flowId: flow.id,
      flowName: flow.title,
      amount: donationAmount,
      amountBigInt: donationAmountBigInt.toString(),
      token: selectedToken,
      streamingMonths,
    })

    // TODO: Implement direct funding logic for native tokens
  }

  return {
    // Button state
    buttonText: buttonState.text,
    isDisabled: buttonState.disabled,

    // Balance state
    hasInsufficientBalance,

    // Actions
    handleFund,
  }
}
