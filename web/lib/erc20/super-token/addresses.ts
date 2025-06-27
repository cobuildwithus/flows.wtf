import { cfav1Address, superfluidAddress } from "@/lib/abis"

export const getHostAddress = (chainId: number) => {
  if (chainId === 1) return superfluidAddress[1]
  if (chainId === 10) return superfluidAddress[10]
  if (chainId === 8453) return superfluidAddress[8453]

  throw new Error(`Superfluid host address not found for chainId: ${chainId}`)
}

export const getCfaAddress = (chainId: number) => {
  if (chainId === 1) return cfav1Address[1]
  if (chainId === 10) return cfav1Address[10]
  if (chainId === 8453) return cfav1Address[8453]

  throw new Error(`CFA address not found for chainId: ${chainId}`)
}
