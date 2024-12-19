import { Address, erc20Abi } from "viem"
import { base } from "viem/chains"
import { useReadContracts } from "wagmi"

export function useERC20Tokens(tokens: Address[], chainId = base.id) {
  const erc20s = tokens.map((token) => ({
    abi: erc20Abi,
    address: token as Address,
    chainId,
  }))

  const { data, refetch, isLoading } = useReadContracts({
    contracts: erc20s.flatMap((erc20) => [
      { ...erc20, functionName: "symbol" },
      { ...erc20, functionName: "name" },
    ]),
  })

  const tokenData = data?.reduce(
    (acc, token, index) => {
      const address = erc20s[index / 2]?.address
      acc.push({
        address,
        symbol: token.result as string,
        name: data[index + 1]?.result as string,
      })
      return acc
    },
    [] as {
      address: Address | undefined
      symbol: string | undefined
      name: string | undefined
    }[],
  )

  return {
    tokens: tokenData,
    refetch,
    isLoading,
  }
}
