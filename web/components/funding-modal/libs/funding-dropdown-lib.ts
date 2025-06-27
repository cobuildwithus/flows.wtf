import { type Token, type TokenKey, type TokenInfo, getTokenBalance, getTokenUSDValue } from "./funding-token-lib"

export interface TokenDropdownItem {
  token: Token
  balance: bigint
  chainName: string
  usdValue: number
}

export function getTokenDropdownItems(
  tokens: Record<string, TokenInfo>,
  chainId: number,
  ethBalances: Record<number, bigint>,
  streamingTokenBalance: bigint,
  ethPrice?: number,
): TokenDropdownItem[] {
  const available: Token[] = Object.entries(tokens).map(([key, token]) => ({
    ...(token as TokenInfo),
    key: key as TokenKey,
  }))

  return available
    .filter((token) => token.chainId === chainId && !token.isNative)
    .map((token) => {
      const balance = getTokenBalance(token, ethBalances, streamingTokenBalance)
      const chainName = tokens[token.key].name
      const usdValue = getTokenUSDValue(token, balance, ethPrice || undefined)

      return {
        token,
        balance,
        chainName,
        usdValue,
      }
    })
}
