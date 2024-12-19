import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Address, erc20Abi } from "viem"
import { base } from "viem/chains"
import { useAccount, useReadContract, useReadContracts } from "wagmi"
import { erc20VotesMintableImplAbi } from "../abis"

export function useTcrToken(contract: Address, spender: Address, chainId = base.id) {
  const { address: owner } = useAccount()

  const erc20 = { abi: erc20Abi, address: contract, chainId }

  const { data, refetch } = useReadContracts({
    contracts: [
      { ...erc20, functionName: "allowance", args: [owner!!, spender] },
      { ...erc20, functionName: "symbol" },
      { ...erc20, functionName: "name" },
    ],
    query: { enabled: !!owner },
  })

  const { data: balance, refetch: refetchBalance } = useReadContract({
    ...erc20,
    functionName: "balanceOf",
    args: [owner!!],
    query: { enabled: !!owner, refetchInterval: 1000 },
  })

  const [allowance, symbol, name] = data || []

  const { prepareWallet, writeContract, isLoading, isConfirmed } = useContractTransaction({
    chainId,
    loading: "Approving...",
    success: "Token approved",
    onSuccess: () => refetch(),
  })

  return {
    allowance: allowance?.result || BigInt(0),
    balance: balance || BigInt(0),
    approve: async (amount: bigint) => {
      await prepareWallet()
      writeContract({
        abi: erc20VotesMintableImplAbi,
        address: contract,
        functionName: "approve",
        args: [spender, amount],
        chainId,
      })
    },
    refetch: () => {
      refetch()
      refetchBalance()
    },
    isApproving: isLoading,
    isApproved: isConfirmed,
    symbol: symbol?.result,
    name: name?.result,
  }
}
