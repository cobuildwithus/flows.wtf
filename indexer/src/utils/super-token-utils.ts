import { USDCx, GARDENx } from "../utils"

interface SuperTokenInfo {
  symbol: string
  prefix: string
}

const SUPER_TOKEN_MAP: Record<string, SuperTokenInfo> = {
  [USDCx.toLowerCase()]: {
    symbol: "USDC",
    prefix: "$",
  },
  [GARDENx.toLowerCase()]: {
    symbol: "Garden",
    prefix: "⚘",
  },
}

export function getSuperTokenInfo(superTokenAddress: string): SuperTokenInfo {
  const normalizedAddress = superTokenAddress.toLowerCase()
  const tokenInfo = SUPER_TOKEN_MAP[normalizedAddress]

  if (!tokenInfo) {
    // Default fallback for unknown tokens
    return {
      symbol: "Unknown",
      prefix: "",
    }
  }

  return tokenInfo
}

export function getSuperTokenSymbol(superTokenAddress: string): string {
  return getSuperTokenInfo(superTokenAddress).symbol
}

export function getSuperTokenPrefix(superTokenAddress: string): string {
  return getSuperTokenInfo(superTokenAddress).prefix
}
