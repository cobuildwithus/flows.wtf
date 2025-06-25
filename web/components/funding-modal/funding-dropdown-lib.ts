import {
  TOKENS,
  AVAILABLE_TOKENS,
  type Token,
  getTokenBalance,
  getTokenUSDValue,
} from "./funding-token-lib"

export interface TokenDropdownItem {
  token: Token
  balance: bigint
  chainName: string
  usdValue: number
}

export function getTokenDropdownItems(
  chainId: number,
  ethBalances: Record<number, bigint>,
  streamingTokenBalance: bigint,
  ethPrice?: number,
): TokenDropdownItem[] {
  return AVAILABLE_TOKENS.filter((token) => token.chainId === chainId).map((token) => {
    const balance = getTokenBalance(token, ethBalances, streamingTokenBalance)
    const chainName = TOKENS[token.key].name
    const usdValue = getTokenUSDValue(token, balance, ethPrice || undefined)

    return {
      token,
      balance,
      chainName,
      usdValue,
    }
  })
}
