import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { erc20VotesArbitratorImplAbi } from "@/lib/abis"
import { useAccount, useReadContract } from "wagmi"
import { base } from "viem/chains"
import { toast } from "sonner"
import { getEthAddress } from "@/lib/utils"
import { useRouter } from "next/navigation"

export const useWithdrawVoterRewards = (
  arbitratorAddress: `0x${string}`,
  disputeId: bigint,
  round: bigint,
) => {
  const { address } = useAccount()
  const chainId = base.id
  const router = useRouter()

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
      router.refresh()
    },
  })

  const withdrawRewards = async (disputeId: bigint, round: bigint) => {
    if (!address) {
      toast.error("Wallet not connected")
      return
    }

    try {
      await prepareWallet()

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
