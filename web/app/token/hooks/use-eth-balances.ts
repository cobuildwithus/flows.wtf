import { base, mainnet } from "viem/chains"
import { useAccount, useBalance } from "wagmi"

export function useEthBalances() {
  const { address } = useAccount()

  const { data: baseBalance = 0n, isLoading: isLoadingBase } = useBalance({
    chainId: base.id,
    address,
    query: { select: (data) => data.value },
  })

  const { data: mainnetBalance = 0n, isLoading: isLoadingMainnet } = useBalance({
    chainId: mainnet.id,
    address,
    query: { select: (data) => data.value },
  })

  function choosePreferredFor(cost: bigint) {
    // Prefer mainnet only if has enough balance on it, but not enough on base
    if (cost > baseBalance && cost < mainnetBalance)
      return { chainId: mainnet.id, balance: mainnetBalance }

    return { chainId: base.id, balance: baseBalance }
  }

  return {
    balances: {
      [base.id]: baseBalance,
      [mainnet.id]: mainnetBalance,
    },
    preferredFor: (cost: bigint) => choosePreferredFor(cost),
    isLoading: isLoadingBase || isLoadingMainnet,
  }
}
