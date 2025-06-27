import { Address, erc20Abi } from "viem"
import { useReadContract, useReadContracts } from "wagmi"
import { getEthAddress } from "../utils"

export function useERC20Allowances(
  contracts: Array<{ token: Address; spender: Address }>,
  owner: Address | undefined,
  chainId: number,
) {
  const { data, refetch } = useReadContracts({
    contracts: contracts.map(({ token, spender }) => ({
      abi: erc20Abi,
      address: token,
      functionName: "allowance",
      args: [owner!!, spender],
      chainId,
    })),
    query: { enabled: !!owner },
  })

  const allowances = data?.map((allowance) => BigInt(allowance.result || 0)) || []

  return {
    allowances,
    refetch,
  }
}

export function useERC20Allowance(
  token: string,
  owner: Address | undefined,
  spender: string,
  chainId: number,
) {
  const { data: allowance, refetch } = useReadContract({
    address: getEthAddress(token),
    abi: erc20Abi,
    functionName: "allowance",
    args: owner && spender ? [owner, getEthAddress(spender)] : undefined,
    chainId,
    query: { enabled: !!owner && !!spender },
  })

  return {
    allowance: allowance || 0n,
    refetch,
  }
}
