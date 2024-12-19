import { BuilderProfileJobBody, EmbeddingType, IsGrantUpdateJobBody, JobBody } from "../types/job"

const validateEnvVars = () => {
  if (!process.env.EMBEDDINGS_QUEUE_URL) {
    throw new Error("EMBEDDINGS_QUEUE_URL is not defined")
  }
  if (!process.env.EMBEDDINGS_QUEUE_API_KEY) {
    throw new Error("EMBEDDINGS_QUEUE_API_KEY is not defined")
  }
}

const makeRequest = async (endpoint: string, body: any) => {
  validateEnvVars()

  const headers = new Headers({
    "Content-Type": "application/json",
    "x-api-key": process.env.EMBEDDINGS_QUEUE_API_KEY || "",
    "Cache-Control": "no-store",
  })

  let lastError
  const maxRetries = 3
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
        throw new Error((text as any)?.message || `Failed request to ${endpoint}`)
      }

      return response
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        // Don't wait after the last attempt
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
  }

  throw lastError
}

export async function postToEmbeddingsQueueRequest(payload: JobBody) {
  try {
    await makeRequest("/add-job", payload)
  } catch (error) {
    console.log("Failed to post to embeddings queue:")
    console.log({
      payload,
      EMBEDDINGS_QUEUE_URL: process.env.EMBEDDINGS_QUEUE_URL,
    })
    throw error
  }
}

export async function postBulkToEmbeddingsQueueRequest(payloads: JobBody[]) {
  await makeRequest("/bulk-add-job", { jobs: payloads })
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
