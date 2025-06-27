interface SuperTokenInfo {
  superTokenSymbol: string
  superTokenPrefix?: string
}

interface FormatCurrencyOptions {
  maximumFractionDigits?: number
  minimumFractionDigits?: number
  locale?: string
}

/**
 * Formats a currency value using super token symbol and prefix
 * @param value - The numeric value to format
 * @param tokenInfo - Object containing superTokenSymbol and optional superTokenPrefix
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
  if (tokenInfo.superTokenPrefix) {
    return `${tokenInfo.superTokenPrefix}${formattedNumber}`
  }

  // Otherwise, use the symbol with a space
  return `${tokenInfo.superTokenSymbol} ${formattedNumber}`
}

/**
 * Formats a currency value for display in components
 * @param value - The numeric value to format
 * @param superTokenSymbol - The token symbol (e.g., "USDC", "Garden")
 * @param superTokenPrefix - Optional prefix (e.g., "$", "⚘")
 * @param options - Number formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  superTokenSymbol: string,
  superTokenPrefix?: string,
  options: FormatCurrencyOptions = {},
): string {
  return formatSuperTokenCurrency(value, { superTokenSymbol, superTokenPrefix }, options)
}
