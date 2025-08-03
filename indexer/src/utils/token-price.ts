const API_BASE = "https://jbdb.up.railway.app"

interface TokenPriceResponse {
  token?: {
    price?: {
      ethPrice?: string
    }
    ethPrice?: string
  }
}

interface ProjectResponse {
  token?: {
    ethPrice?: string
  }
}

/**
 * Helper function to fetch and parse price data from the API for token endpoints
 */
async function fetchTokenPriceData(url: string): Promise<string | null> {
  try {
    console.log({ url })
    const res = await fetch(url)
    if (!res.ok) return null

    const json = (await res.json()) as TokenPriceResponse
    // For token endpoints, the price is nested under token.price.ethPrice
    const price = json?.token?.price?.ethPrice
    return price ?? null
  } catch (err) {
    console.error("fetchTokenPriceData error", err)
    return null
  }
}

/**
 * Helper function to fetch and parse price data from the API for project endpoints
 */
async function fetchProjectPriceData(url: string): Promise<string | null> {
  try {
    console.log({ url })
    const res = await fetch(url)
    if (!res.ok) return null

    // Project endpoints return an array of objects
    const json = (await res.json()) as ProjectResponse[]
    const priceObj = Array.isArray(json) ? json[0] : json
    // For project endpoints, the price is directly under token.ethPrice
    const price = priceObj?.token?.ethPrice
    return price ?? null
  } catch (err) {
    console.error("fetchProjectPriceData error", err)
    return null
  }
}

/**
 * Fetches the price of an ERC-20 token denominated in ETH (returned in wei as a string).
 * Returns null if the API has no price for the token.
 */
export async function fetchTokenPriceWeiForToken(
  chainId: number,
  tokenAddress: string
): Promise<string | null> {
  const address = tokenAddress.toLowerCase()
  return fetchTokenPriceData(`${API_BASE}/price/${chainId}/${address}`)
}

/**
 * Fetches the price of a project's token denominated in ETH (returned in wei as a string).
 * Returns null if the API has no price for the token.
 */
export async function fetchTokenPriceWeiForProject(
  chainId: number,
  projectId: number
): Promise<string | null> {
  return fetchProjectPriceData(`${API_BASE}/project/${chainId}/${projectId}`)
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
