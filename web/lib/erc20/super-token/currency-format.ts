interface SuperTokenInfo {
  underlyingTokenSymbol: string
  underlyingTokenPrefix?: string
}

interface FormatCurrencyOptions {
  maximumFractionDigits?: number
  minimumFractionDigits?: number
  locale?: string
}

/**
 * Formats a currency value using super token symbol and prefix
 * @param value - The numeric value to format
 * @param tokenInfo - Object containing underlyingTokenSymbol and optional underlyingTokenPrefix
 * @param options - Number formatting options
 * @returns Formatted currency string
 */
export function formatSuperTokenCurrency(
  value: number,
  tokenInfo: SuperTokenInfo,
  options: FormatCurrencyOptions = {},
): string {
  const { maximumFractionDigits = 0, minimumFractionDigits = 0, locale = "en" } = options

  const formattedNumber = Intl.NumberFormat(locale, {
    maximumFractionDigits,
    minimumFractionDigits,
  }).format(value)

  // If there's a prefix (like $ or ⚘), use it
  if (tokenInfo.underlyingTokenPrefix) {
    return `${tokenInfo.underlyingTokenPrefix}${formattedNumber}`
  }

  // Otherwise, use the symbol with a space
  return `${formattedNumber} ${tokenInfo.underlyingTokenSymbol}`
}

/**
 * Formats a currency value for display in components
 * @param value - The numeric value to format
 * @param underlyingTokenSymbol - The token symbol (e.g., "USDC", "Garden")
 * @param underlyingTokenPrefix - Optional prefix (e.g., "$", "⚘")
 * @param options - Number formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  underlyingTokenSymbol: string,
  underlyingTokenPrefix?: string,
  options: FormatCurrencyOptions = {},
): string {
  return formatSuperTokenCurrency(value, { underlyingTokenSymbol, underlyingTokenPrefix }, options)
}
