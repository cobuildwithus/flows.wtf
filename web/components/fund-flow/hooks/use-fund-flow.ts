import { parseUnits } from "viem"
import { type Token } from "../libs/funding-token-lib"
import { useLogin } from "@/lib/auth/use-login"
import { useApproveErc20 } from "@/lib/erc20/use-approve-erc20"
import { useApprovalAmount } from "./use-approval-amount"
import { useFundButtonState } from "./use-fund-button-state"
import { useInsufficientBalance } from "./use-insufficient-balance"
import { useCreateFlow } from "@/lib/erc20/super-token/use-create-flow"
import { Grant } from "@/lib/database/types"
import { useExistingFlows } from "@/lib/superfluid/use-existing-flows"
import { useUpdateFlow } from "@/lib/erc20/super-token/use-update-flow"
import { useRouter } from "next/navigation"

interface UseFundingProps {
  selectedToken: Token
  donationAmount: string
  flow: Pick<
    Grant,
    "id" | "title" | "chainId" | "underlyingERC20Token" | "superToken" | "recipient"
  >
  totalTokenBalance: bigint
  superTokenBalance?: bigint
  isStreamingToken?: boolean
  streamingMonths: number
}

export function useFundFlow({
  selectedToken,
  donationAmount,
  flow,
  totalTokenBalance,
  isStreamingToken,
  streamingMonths,
}: UseFundingProps) {
  const router = useRouter()
  const { authenticated, isConnected, login, connectWallet, address } = useLogin()
  const { data: existingFlows, mutate } = useExistingFlows(address, flow.chainId, flow.recipient)

  const { approvalNeeded, approvalAmount, needFromUnderlying } = useApprovalAmount({
    donationAmount,
    isNativeToken: selectedToken.isNative,
    flow,
  })

  const { approve, isLoading: isApproving } = useApproveErc20({
    chainId: flow.chainId,
    tokenAddress: flow.underlyingERC20Token as `0x${string}`,
    spenderAddress: flow.superToken as `0x${string}`,
    onSuccess: () => {
      router.refresh()
    },
  })

  const { createFlow, isLoading: isUpgrading } = useCreateFlow({
    chainId: flow.chainId,
    superTokenAddress: flow.superToken as `0x${string}`,
    onSuccess: () => {
      router.refresh()
      mutate()
    },
  })

  const { updateFlow, isLoading: isUpdating } = useUpdateFlow({
    chainId: flow.chainId,
    superTokenAddress: flow.superToken as `0x${string}`,
    onSuccess: () => {
      router.refresh()
      mutate()
    },
  })

  // Track if balance is insufficient
  const hasInsufficientBalance = useInsufficientBalance({
    donationAmount,
    selectedToken,
    totalTokenBalance,
    isStreamingToken,
  })

  // Button state logic
  const buttonState = useFundButtonState({
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
  })

  const handleFund = async () => {
    if (!authenticated) return login()
    if (!isConnected) return connectWallet()
    const hasOpenFlows = existingFlows?.filter((flow) => flow.isActive).length ?? 0 > 0

    const donationAmountBigInt = parseUnits(donationAmount, 18)

    // Calculate monthly flow rate based on streaming months
    const monthlyFlowRate = donationAmountBigInt / BigInt(streamingMonths)

    // For streaming tokens, handle approval and upgrade in batch
    if (isStreamingToken) {
      // Step 1: Handle approval if needed
      if (approvalNeeded && approvalAmount > 0n) {
        await approve(approvalAmount)
        return // Wait for approval to complete before continuing
      }
    }

    if (!hasOpenFlows) {
      // Use the batch operation to upgrade tokens and create flow in one transaction
      await createFlow(needFromUnderlying, flow.recipient as `0x${string}`, monthlyFlowRate)
      return
    }

    await updateFlow(needFromUnderlying, flow.recipient as `0x${string}`, monthlyFlowRate)
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
