import { formatUnits } from "viem"
import { base, mainnet, optimism } from "viem/chains"

export const TOKENS = {
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
  "gardens-optimism": {
    symbol: "⚘GARDEN",
    name: "Gardens",
    chainId: optimism.id,
    decimals: 18,
    isNative: false,
    logo: "/gardens.png",
  },
} as const

export type TokenKey = keyof typeof TOKENS
export type Token = (typeof TOKENS)[TokenKey] & { key: TokenKey }

export const AVAILABLE_TOKENS: Token[] = Object.entries(TOKENS).map(([key, token]) => ({
  key: key as TokenKey,
  ...token,
}))

export const formatTokenAmount = (amount: bigint, decimals: number, symbol: string): string => {
  const formatted = formatUnits(amount, decimals)
  const number = Number(formatted)

  if (number === 0) return "0"
  if (number < 0.000001 && symbol === "ETH") {
    return number.toFixed(8).replace(/\.?0+$/, "")
  }

  const maxDecimals = symbol === "USDC" ? 2 : 6
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
