const apiKey = `${process.env.SCRAPECREATORS_API_KEY}`

if (!apiKey) throw new Error("apiKey environment variable is not set")

const BASE_URL = "https://api.scrapecreators.com/v1/"

export async function getSocialMetrics<T>(path: string, cacheTtl = 21600): Promise<T> {
  try {
    const response = await fetch(BASE_URL + path.replace(/^\//, ""), {
      headers: { "x-api-key": apiKey, Accept: "application/json" },
      next: { revalidate: cacheTtl },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error(error)
      throw new Error(error?.message || "ScrapeCreators API error")
    }

    return (await response.json()) as T
  } catch (error) {
    console.error("Error fetching from ScrapeCreators API:", error)
    throw error
  }
}
