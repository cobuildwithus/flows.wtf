const API_BASE = "https://jbdb.up.railway.app/price"

interface PriceApiResponse {
  token?: { ethPrice?: string }
}

/**
 * Fetches the price of an ERC-20 token denominated in ETH (returned in wei as a string).
 * Returns null if the API has no price for the token.
 */
export async function fetchTokenPriceWei(
  chainId: number,
  tokenAddress: string
): Promise<string | null> {
  const address = tokenAddress.toLowerCase()
  try {
    const res = await fetch(`${API_BASE}/${chainId}/${address}`)
    if (!res.ok) return null

    // Some endpoints return a single object, others return an array – handle both.
    const json = (await res.json()) as PriceApiResponse | PriceApiResponse[]
    const priceObj = Array.isArray(json) ? json[0] : json
    const price = priceObj?.token?.ethPrice
    return price ?? null
  } catch (err) {
    console.error("fetchTokenPriceWei error", err)
    return null
  }
}

/**
 * Fetches the current ETH-USD spot price from Coinbase.
 * Returns the price as a number (e.g. 3150.42) or null on failure.
 */
export async function fetchEthUsdPrice(): Promise<number | null> {
  try {
    const response = await fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot")
    if (!response.ok) return null

    const json = await response.json()
    const ethRate = Number.parseFloat((json as any).data?.amount)

    if (!ethRate || Number.isNaN(ethRate)) {
      return null
    }

    return ethRate
  } catch (err) {
    console.error("fetchEthUsdPrice error", err)
    return null
  }
}
