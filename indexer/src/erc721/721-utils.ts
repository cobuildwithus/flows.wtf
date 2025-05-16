export const getTokenIdentifier = (chainId: number, tokenContract: string, tokenId: number) =>
  `${chainId}-${tokenContract.toLowerCase()}-${tokenId.toString()}`

export const getOwnerContractChainId = (chainId: number, tokenContract: string, owner: string) =>
  `${chainId}-${tokenContract.toLowerCase()}-${owner.toLowerCase()}`
