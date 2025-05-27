import { PrismaClient as JuiceboxClient } from "@prisma/juicebox"

const isDevelopment = process.env.NODE_ENV !== "production"

const juiceboxClientSingleton = () => {
  if (isDevelopment) {
    return new JuiceboxClient({
      datasources: {
        db: { url: process.env.JUICEBOX_DATABASE_URL },
      },
    })
  }
  return new JuiceboxClient()
}

declare const globalThis: {
  juicebox: ReturnType<typeof juiceboxClientSingleton>
} & typeof global

const juiceboxDb = globalThis.juicebox ?? juiceboxClientSingleton()

export { juiceboxDb }

if (process.env.NODE_ENV !== "production") globalThis.juicebox = juiceboxDb
