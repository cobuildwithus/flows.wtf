"use server"

interface KeyResponse {
  pinata_api_key: string
  pinata_api_secret: string
  JWT: string
}

export async function createKey(): Promise<KeyResponse | null> {
  try {
    const response = await fetch("https://api.pinata.cloud/v3/pinata/keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: JSON.stringify({
        keyName: Math.random().toString(36).substring(2) + Date.now().toString(36),
        permissions: { endpoints: { pinning: { pinFileToIPFS: true } } },
        maxUses: 1,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create API key")
    }

    const data: KeyResponse = await response.json()
    return data
  } catch (error) {
    console.error("Error creating Pinata API Key:", error)
    return null
  }
}
