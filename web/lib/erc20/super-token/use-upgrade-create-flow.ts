"use client"

import {
  superTokenAbi,
  cfav1ForwarderAbi,
  cfav1ForwarderAddress,
  superfluidImplAbi,
} from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { encodeFunctionData } from "viem"
import { calculateFlowratePerSecond, TIME_UNIT } from "./flow-rate"
import { toast } from "sonner"
import { OPERATION_TYPE } from "./operation-type"
import { getHostAddress } from "./addresses"

// same on all networks
const cfaAddress = cfav1ForwarderAddress[8453]

export const useUpgradeAndCreateFlow = (args: {
  chainId: number
  superTokenAddress: `0x${string}`
  onSuccess?: (hash: string) => void
}) => {
  const { chainId, superTokenAddress, onSuccess } = args

  const {
    prepareWallet,
    writeContract,
    isLoading,
    isSuccess,
    isError,
    error,
    account: sender,
  } = useContractTransaction({
    chainId,
    loading: "Upgrading tokens...",
    success: "Tokens upgraded successfully",
    onSuccess,
  })

  const upgrade = async (amount: bigint, receiver: `0x${string}`, monthlyFlowRate: bigint) => {
    await prepareWallet()
    if (!sender) return toast.error("Please connect your wallet")

    const upgradeData = encodeFunctionData({
      abi: superTokenAbi,
      functionName: "upgrade",
      args: [amount],
    })

    const createFlowData = encodeFunctionData({
      abi: cfav1ForwarderAbi,
      functionName: "createFlow",
      args: [
        superTokenAddress,
        sender,
        receiver,
        calculateFlowratePerSecond({ amountWei: monthlyFlowRate, timeUnit: TIME_UNIT.month }),
        "0x",
      ],
    })

    const ops = [
      {
        operationType: OPERATION_TYPE.SUPERTOKEN_UPGRADE,
        target: superTokenAddress,
        data: upgradeData,
      },
      {
        operationType: OPERATION_TYPE.SUPERFLUID_CALL_AGREEMENT,
        target: cfaAddress,
        data: createFlowData,
      },
    ] as const

    writeContract({
      address: getHostAddress(chainId),
      abi: superfluidImplAbi,
      functionName: "batchCall",
      args: [ops],
      chainId,
    })
  }

  return {
    upgrade,
    isLoading,
    isSuccess,
    isError,
    error,
  }
}
