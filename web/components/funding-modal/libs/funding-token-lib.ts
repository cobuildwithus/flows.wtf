import { formatUnits } from "viem"
import { base, mainnet, optimism } from "viem/chains"

export interface TokenInfo {
  symbol: string
  name: string
  chainId: number
  decimals: number
  isNative: boolean
  logo?: string
  address?: string
}

export const TOKENS: Record<string, TokenInfo> = {
  [`eth-${mainnet.id}`]: {
    symbol: "ETH",
    name: "Ethereum",
    chainId: mainnet.id,
    decimals: 18,
    isNative: true,
  },
  [`eth-${base.id}`]: {
    symbol: "ETH",
    name: "Base ETH",
    chainId: base.id,
    decimals: 18,
    isNative: true,
  },
  [`eth-${optimism.id}`]: {
    symbol: "ETH",
    name: "Optimism ETH",
    chainId: optimism.id,
    decimals: 18,
    isNative: true,
  },
}

export type TokenKey = keyof typeof TOKENS | string
export interface Token extends TokenInfo {
  key: TokenKey
}

export const AVAILABLE_TOKENS: Token[] = Object.entries(TOKENS).map(([key, token]) => ({
  key: key as TokenKey,
  ...token,
}))

export function getTokensWithFlow(flow: {
  superToken: string
  chainId: number
  underlyingTokenSymbol: string
  underlyingTokenName: string
  underlyingTokenDecimals: number
  underlyingTokenLogo: string | null
}): Record<string, TokenInfo> {
  const flowTokenKey = `${flow.superToken}-${flow.chainId}`
  return {
    ...TOKENS,
    [flowTokenKey]: {
      symbol: flow.underlyingTokenSymbol,
      name: flow.underlyingTokenName,
      chainId: flow.chainId,
      decimals: flow.underlyingTokenDecimals,
      isNative: false,
      logo: flow.underlyingTokenLogo ?? undefined,
      address: flow.superToken,
    },
  }
}

export const formatTokenAmount = (amount: bigint, decimals: number, symbol: string): string => {
  const formatted = formatUnits(amount, 18)
  const number = Number(formatted)

  if (number === 0) return "0"
  if (number < 0.000001 && symbol === "ETH") {
    return number.toFixed(8).replace(/\.?0+$/, "")
  }

  // For GARDEN tokens with large balances, use 2 decimals; otherwise use more
  let maxDecimals = decimals
  if (symbol === "USDC") {
    maxDecimals = 2
  } else {
    if (number >= 10) maxDecimals = 2
    else if (number >= 1) maxDecimals = 4
  }

  return number.toFixed(maxDecimals).replace(/\.?0+$/, "")
}

export const validateNumericInput = (value: string, maxDecimals: number): string => {
  const sanitized = value.replace(/[^0-9.]/g, "")
  const parts = sanitized.split(".")

  if (parts.length <= 2) {
    if (parts.length === 2 && parts[1].length > maxDecimals) {
      parts[1] = parts[1].substring(0, maxDecimals)
    }
    return parts.join(".")
  }

  return value
}

export const getTokenBalance = (
  token: Token,
  ethBalances: Record<number, bigint>,
  underlyingTokenBalance?: bigint,
): bigint => {
  if (token.isNative) {
    return ethBalances[token.chainId] || 0n
  }

  return underlyingTokenBalance || 0n
}

export const getTokenUSDValue = (token: Token, balance: bigint, ethPrice?: number): number => {
  const amount = Number(formatUnits(balance, token.decimals))

  if (token.symbol === "ETH" && ethPrice) return amount * ethPrice

  return amount
}
