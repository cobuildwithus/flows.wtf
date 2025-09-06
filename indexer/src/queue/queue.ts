import { BuilderProfileJobBody, EmbeddingType, IsGrantUpdateJobBody, JobBody } from "./job"

const validateEnvVars = () => {
  if (!process.env.EMBEDDINGS_QUEUE_URL) {
    throw new Error("EMBEDDINGS_QUEUE_URL is not defined")
  }
  if (!process.env.EMBEDDINGS_QUEUE_API_KEY) {
    throw new Error("EMBEDDINGS_QUEUE_API_KEY is not defined")
  }
}

const makeRequest = async (endpoint: string, body: any) => {
  if (process.env.EMBEDDINGS_DISABLED == "true") return

  validateEnvVars()

  const headers = new Headers({
    "Content-Type": "application/json",
    "x-api-key": process.env.EMBEDDINGS_QUEUE_API_KEY || "",
    "Cache-Control": "no-store",
  })

  let lastError
  const maxRetries = 6 // Increased from 4 to 8
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(process.env.EMBEDDINGS_QUEUE_URL + endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const text = await response.text()
        console.error({ text })
        console.error(`Failed request to ${endpoint}:`, text)
      }

      return response
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        // Exponential backoff with jitter
        const baseDelay = Math.min(1000 * Math.pow(2, i), 10000) // Cap at 10 seconds
        const jitter = Math.random() * 1000 // Add up to 1 second of random jitter
        await new Promise((resolve) => setTimeout(resolve, baseDelay + jitter))
      }
    }
  }

  throw lastError
}

export async function deleteEmbeddingRequest(contentHash: string, type: EmbeddingType) {
  await makeRequest("/delete-embedding", { contentHash, type })
}

export async function postBulkIsGrantsUpdateRequest(payloads: IsGrantUpdateJobBody[]) {
  await makeRequest("/bulk-add-is-grants-update", { jobs: payloads })
}

export async function postBuilderProfileRequest(payloads: BuilderProfileJobBody[]) {
  await makeRequest("/bulk-add-builder-profile", { jobs: payloads })
}
