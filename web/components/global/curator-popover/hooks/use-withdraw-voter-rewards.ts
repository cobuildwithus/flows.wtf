import { erc20VotesArbitratorImplAbi } from "@/lib/abis"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { toast } from "sonner"
import { base } from "viem/chains"
import { useAccount, useReadContract } from "wagmi"
import { useUserTcrTokens } from "./use-user-tcr-tokens"

const chainId = base.id

export const useWithdrawVoterRewards = (
  arbitratorAddress: `0x${string}`,
  disputeId: bigint,
  round: bigint,
) => {
  const { address } = useAccount()
  const { mutateEarnings } = useUserTcrTokens(address)

  const { data: voterRewardsBalance, isLoading: isBalanceLoading } = useReadContract({
    address: getEthAddress(arbitratorAddress),
    abi: erc20VotesArbitratorImplAbi,
    functionName: "getRewardsForRound",
    args: address ? [disputeId, round, address] : undefined,
    chainId,
  })

  const { prepareWallet, writeContract, isLoading, toastId } = useContractTransaction({
    chainId,
    success: "Rewards withdrawn successfully!",
    onSuccess: (hash) => {
      mutateEarnings()
    },
  })

  const withdrawRewards = async (disputeId: bigint, round: bigint) => {
    try {
      await prepareWallet()

      if (!address) {
        toast.error("Wallet not connected")
        return
      }

      writeContract({
        account: address,
        address: getEthAddress(arbitratorAddress),
        abi: erc20VotesArbitratorImplAbi,
        functionName: "withdrawVoterRewards",
        args: [disputeId, round, address],
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    withdrawRewards,
    isLoading: isBalanceLoading || isLoading,
    voterRewardsBalance: voterRewardsBalance || BigInt(0),
  }
}
