import { Address } from "viem"
import { base } from "viem/chains"
import { useFlowsForParent } from "./use-flows-for-parent"
import { useERC20Tokens } from "./use-erc20s"

export function useERC20TokensForParent(parentGrantContract: Address, chainId = base.id) {
  const { grants, isLoading: isLoadingFlows } = useFlowsForParent(parentGrantContract)
  const erc20s = grants.map((grant) => grant.erc20 as Address)

  const { tokens, refetch, isLoading } = useERC20Tokens(erc20s, chainId)

  const tokenData = tokens?.reduce(
    (acc, token, index) => {
      if (index % 2 === 0) {
        const address = token.address
        acc.push({
          address,
          symbol: token.symbol,
          image: grants.find((grant) => grant.erc20 === address)?.image,
          name: token.name,
          tagline: grants.find((grant) => grant.erc20 === address)?.tagline ?? undefined,
          tokenEmitter: grants.find((grant) => grant.erc20 === address)?.tokenEmitter ?? undefined,
        })
      }
      return acc
    },
    [] as {
      address: Address | undefined
      symbol: string | undefined
      name: string | undefined
      image: string | undefined
      tagline: string | undefined
      tokenEmitter: string | undefined
    }[],
  )

  return {
    tokens: tokenData,
    refetch,
    isLoading: isLoadingFlows || isLoading,
  }
}
