import { parseUnits } from "viem"
import { type Token } from "../libs/funding-token-lib"
import { useApproveErc20 } from "@/lib/erc20/use-approve-erc20"
import { useApprovalAmount } from "./use-approval-amount"
import { useFundButtonState } from "./use-fund-button-state"
import { useInsufficientBalance } from "./use-insufficient-balance"
import { useCreateFlow } from "@/lib/erc20/super-token/use-create-flow"
import { Grant } from "@/lib/database/types"
import { useExistingFlows } from "@/lib/superfluid/use-existing-flows"
import { useUpdateFlow } from "@/lib/erc20/super-token/use-update-flow"
import { useAccount } from "wagmi"

interface UseFundingProps {
  selectedToken: Token
  donationAmount: string
  flow: Pick<
    Grant,
    | "id"
    | "title"
    | "chainId"
    | "underlyingERC20Token"
    | "superToken"
    | "recipient"
    | "underlyingTokenDecimals"
  >
  totalTokenBalance: bigint
  superTokenBalance?: bigint
  isStreamingToken?: boolean
  streamingMonths: number
  onSuccess?: () => void
}

export function useFundFlow({
  selectedToken,
  donationAmount,
  flow,
  totalTokenBalance,
  isStreamingToken,
  streamingMonths,
  onSuccess,
}: UseFundingProps) {
  const { address } = useAccount()
  const { data: existingFlows, mutate: mutateExistingFlows } = useExistingFlows(
    address,
    flow.chainId,
    flow.recipient,
  )

  const {
    approvalNeeded,
    approvalAmount,
    upgradeAmount, // in supertoken 18 decimals
    mutate: mutateApprovalAmount,
  } = useApprovalAmount({
    donationAmount,
    isNativeToken: selectedToken.isNative,
    flow,
  })

  const { approve, isLoading: isApproving } = useApproveErc20({
    chainId: flow.chainId,
    tokenAddress: flow.underlyingERC20Token as `0x${string}`,
    spenderAddress: flow.superToken as `0x${string}`,
    onSuccess: () => {
      mutateApprovalAmount()
    },
  })

  const { createFlow, isLoading: isUpgrading } = useCreateFlow({
    chainId: flow.chainId,
    superTokenAddress: flow.superToken as `0x${string}`,
    onSuccess: () => {
      mutateExistingFlows()
    },
  })

  const { updateFlow, isLoading: isUpdating } = useUpdateFlow({
    chainId: flow.chainId,
    superTokenAddress: flow.superToken as `0x${string}`,
    onSuccess: () => {
      mutateExistingFlows()
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
    const hasOpenFlows = existingFlows?.filter((flow) => flow.isActive).length ?? 0 > 0

    const donationAmountBigInt = parseUnits(donationAmount, 18)

    // Calculate monthly flow rate based on streaming months
    const monthlyFlowRate = donationAmountBigInt / BigInt(streamingMonths)

    // For streaming tokens, handle approval and upgrade in batch
    if (isStreamingToken) {
      // Step 1: Handle approval if needed
      if (approvalNeeded && approvalAmount > 0n) {
        await approve(approvalAmount)
      }
    }

    if (!hasOpenFlows) {
      // Use the batch operation to upgrade tokens and create flow in one transaction
      await createFlow(upgradeAmount, flow.recipient as `0x${string}`, monthlyFlowRate)
    } else {
      await updateFlow(upgradeAmount, flow.recipient as `0x${string}`, monthlyFlowRate)
    }

    if (onSuccess) {
      onSuccess()
    }
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
