import { PrismaClient as FarcasterClient } from "@prisma/farcaster"

const isDevelopment = process.env.NODE_ENV !== "production"

const farcasterClientSingleton = () => {
  if (isDevelopment) {
    return new FarcasterClient({
      datasources: {
        db: { url: process.env.FARCASTER_DATABASE_URL },
      },
    })
  }
  return new FarcasterClient()
}

declare const globalThis: {
  farcaster: ReturnType<typeof farcasterClientSingleton>
} & typeof global

const farcasterDb = globalThis.farcaster ?? farcasterClientSingleton()

export { farcasterDb }

if (process.env.NODE_ENV !== "production") globalThis.farcaster = farcasterDb
