export const getTokenIdentifier = (chainId: number, tokenContract: string, tokenId: number) =>
  `${chainId}-${tokenContract}-${tokenId.toString()}`

export const getOwnerContractChainId = (chainId: number, tokenContract: string, owner: string) =>
  `${chainId}-${tokenContract}-${owner}`
