import { superTokenAbi, cfav1Abi } from "@/lib/abis"
import { encodeFunctionData } from "viem"
import { calculateFlowratePerSecond } from "./flow-rate"
import { toast } from "sonner"
import { OPERATION_TYPE, prepareOperation, TIME_UNIT } from "./operation-type"
import { getCfaAddress } from "./addresses"

export type FlowOperationType = "create" | "update" | "delete"

export interface FlowOperationParams {
  amountToUpgrade: bigint
  receiver: `0x${string}`
  monthlyFlowRate: bigint
  superTokenAddress: `0x${string}`
  chainId: number
  operationType: FlowOperationType
  sender: `0x${string}` | undefined
}

export interface FlowOperationConfig {
  chainId: number
  superTokenAddress: `0x${string}`
  onSuccess?: (hash: string) => void
}

/**
 * Shared configuration for flow operation hooks
 */
export function getFlowOperationConfig(
  operationType: FlowOperationType,
  onSuccess?: (hash: string) => void,
) {
  switch (operationType) {
    case "create":
      return {
        loading: "Creating flow...",
        success: "Flow created successfully",
        onSuccess,
      }
    case "update":
      return {
        loading: "Updating flow...",
        success: "Flow updated successfully",
        onSuccess,
      }
    case "delete":
      return {
        loading: "Deleting flow...",
        success: "Flow deleted successfully",
        onSuccess,
      }
    default:
      return {
        loading: "Processing flow...",
        success: "Flow operation completed",
        onSuccess,
      }
  }
}

/**
 * Validates wallet connection before flow operations
 */
export function validateWallet(sender: `0x${string}` | undefined): boolean {
  if (!sender) {
    toast.error("Please connect your wallet")
    return false
  }
  return true
}

/**
 * Builds the operations array for Superfluid batch call
 */
export function buildFlowOperations({
  amountToUpgrade,
  receiver,
  monthlyFlowRate,
  superTokenAddress,
  chainId,
  operationType,
}: Omit<FlowOperationParams, "sender">) {
  // Convert monthly flow rate to per-second flow rate for Superfluid
  const flowRate = calculateFlowratePerSecond({
    amountWei: monthlyFlowRate,
    timeUnit: TIME_UNIT.month,
  })

  const ops = []

  // First operation: Upgrade ERC20 tokens to Super Tokens (if amount > 0)
  if (amountToUpgrade > 0n) {
    const upgradeData = encodeFunctionData({
      abi: superTokenAbi,
      functionName: "upgrade",
      args: [amountToUpgrade],
    })

    ops.push(
      prepareOperation({
        operationType: OPERATION_TYPE.SUPERTOKEN_UPGRADE,
        target: superTokenAddress,
        data: upgradeData,
      }),
    )
  }

  // Second operation: Create or update the Superfluid flow
  const flowFunctionName = operationType === "create" ? "createFlow" : "updateFlow"
  const flowData = encodeFunctionData({
    abi: cfav1Abi,
    functionName: flowFunctionName,
    args: [superTokenAddress, receiver, flowRate, "0x"],
  })

  ops.push(
    prepareOperation({
      operationType: OPERATION_TYPE.SUPERFLUID_CALL_AGREEMENT,
      target: getCfaAddress(chainId),
      data: flowData,
    }),
  )

  return ops
}
