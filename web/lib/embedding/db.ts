import { neon } from "@neondatabase/serverless"

const embeddingsDb = neon(process.env.EMBEDDINGS_POSTGRES_URL as string)

export { embeddingsDb }
