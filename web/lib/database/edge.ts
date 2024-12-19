// this will be updated by the edge-prebuild.js script to pull in the edge client
import { PrismaClient } from "@prisma/flows"
import { withAccelerate } from "@prisma/extension-accelerate"
// import { withOptimize } from "@prisma/extension-optimize"

const isDevelopment = process.env.NODE_ENV !== "production"
const optimizeApiKey = process.env.PRISMA_OPTIMIZE_KEY

if (!optimizeApiKey) {
  throw new Error("PRISMA_OPTIMIZE_KEY is not set")
}

const getAccelerateClient = () => {
  return new PrismaClient().$extends(withAccelerate())
}

const prismaClientSingleton = () => {
  if (isDevelopment) {
    return new PrismaClient()
    // .$extends(withOptimize({ apiKey: optimizeApiKey }))
  }
  return getAccelerateClient()
}

declare const globalThis: {
  prisma: ReturnType<typeof getAccelerateClient>
} & typeof global

const database = globalThis.prisma ?? prismaClientSingleton()

export default database

if (process.env.NODE_ENV !== "production") globalThis.prisma = database

export const getCacheStrategy = (swr?: number, ttl?: number) => {
  return isDevelopment ? {} : { cacheStrategy: { swr, ttl } }
}
