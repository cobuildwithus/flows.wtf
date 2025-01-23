"use client"

import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Address } from "viem"
import { base } from "viem/chains"
import { useAccount } from "wagmi"
import { erc20VotesMintableImplAbi } from "../abis"
import { getTokenData } from "./get-token-data"
import useSWR from "swr"

export function useTcrToken(contract: Address, spender: Address, chainId = base.id) {
  const { address: owner } = useAccount()

  const { data, mutate } = useSWR(`token-data:${JSON.stringify([contract, owner, spender])}`, () =>
    getTokenData(contract, owner, spender),
  )

  const { prepareWallet, writeContract, isLoading, isConfirmed } = useContractTransaction({
    chainId,
    loading: "Approving...",
    success: "Token approved",
    onSuccess: () => mutate(),
  })

  return {
    allowance: data?.allowance || BigInt(0),
    balance: data?.balance || BigInt(0),
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
    refetch: () => mutate(),
    isApproving: isLoading,
    isApproved: isConfirmed,
    symbol: data?.symbol,
    name: data?.name,
  }
}
