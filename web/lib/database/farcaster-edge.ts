import { PrismaClient as FarcasterClient } from "@prisma/farcaster/edge"
import { withAccelerate } from "@prisma/extension-accelerate"
// import { withOptimize } from "@prisma/extension-optimize"

const isDevelopment = process.env.NODE_ENV !== "production"
const optimizeApiKey = process.env.PRISMA_OPTIMIZE_KEY

if (!optimizeApiKey) {
  throw new Error("PRISMA_OPTIMIZE_KEY is not set")
}

const farcasterClientSingleton = () => {
  if (isDevelopment) {
    return new FarcasterClient({
      datasources: {
        db: { url: process.env.FARCASTER_DATABASE_URL },
      },
    }).$extends(withAccelerate())
    // .$extends(withOptimize({ apiKey: optimizeApiKey }))
  }
  return new FarcasterClient().$extends(withAccelerate())
}

declare const globalThis: {
  farcaster: ReturnType<typeof farcasterClientSingleton>
} & typeof global

const farcasterDb = globalThis.farcaster ?? farcasterClientSingleton()

export { farcasterDb }

if (process.env.NODE_ENV !== "production") globalThis.farcaster = farcasterDb
