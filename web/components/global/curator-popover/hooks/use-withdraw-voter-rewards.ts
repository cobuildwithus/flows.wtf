import { erc20VotesArbitratorImplAbi } from "@/lib/abis"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { toast } from "sonner"
import { base } from "viem/chains"
import { useAccount } from "wagmi"
import useSWR from "swr"
import { getVoterRewardsBalance } from "./get-voter-rewards-balance"
import { useUserTcrTokens } from "./use-user-tcr-tokens"

const chainId = base.id

export const useWithdrawVoterRewards = (
  arbitratorAddress: `0x${string}`,
  disputeId: bigint,
  round: bigint,
) => {
  const { address } = useAccount()
  const { mutateEarnings } = useUserTcrTokens(address)

  const {
    data: voterRewardsBalance,
    isLoading: isBalanceLoading,
    mutate: refetchBalance,
  } = useSWR(
    address ? ["voter-rewards-balance", arbitratorAddress, disputeId, round, address] : null,
    () =>
      address
        ? getVoterRewardsBalance(arbitratorAddress, disputeId, round, address)
        : Promise.resolve(BigInt(0)),
  )

  const { prepareWallet, writeContract, isLoading, toastId } = useContractTransaction({
    chainId,
    success: "Rewards withdrawn successfully!",
    onSuccess: () => {
      mutateEarnings()
      refetchBalance()
    },
  })

  const withdrawRewards = async () => {
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
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred"
      toast.error(errorMessage, { id: toastId })
    }
  }

  return {
    withdrawRewards,
    isLoading: isBalanceLoading || isLoading,
    voterRewardsBalance: voterRewardsBalance || BigInt(0),
  }
}
