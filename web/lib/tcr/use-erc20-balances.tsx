import { Address, erc20Abi } from "viem"
import { base } from "viem/chains"
import { useReadContracts } from "wagmi"
import { getEthAddress } from "../utils"

export function useERC20Balances(contracts: Address[], owner: Address | undefined) {
  const { data, refetch } = useReadContracts({
    contracts: contracts.map((contract) => ({
      abi: erc20Abi,
      address: contract,
      functionName: "balanceOf",
      args: [owner!!],
      chainId: base.id,
    })),
    query: { enabled: !!owner },
  })

  const balances = data?.map((balance) => BigInt(balance.result || 0)) || []

  return {
    balances,
    refetch,
  }
}

export function useERC20Balance(contract: string, owner: Address | undefined) {
  const { balances, refetch } = useERC20Balances([getEthAddress(contract)], owner)

  return {
    balance: balances[0] || 0n,
    refetch,
  }
}
