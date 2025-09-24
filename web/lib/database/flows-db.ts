import { PrismaClient, Prisma } from "@prisma/flows"

function stringifyScalars(x: unknown): unknown {
  // Handle Prisma Decimal
  if ((Prisma as any).Decimal?.isDecimal?.(x)) return (x as any).toString()
  // Handle BigInt to avoid JSON serialization issues
  if (typeof x === "bigint") return x.toString()

  if (Array.isArray(x)) return x.map(stringifyScalars)
  if (x && typeof x === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(x)) out[k] = stringifyScalars(v)
    return out
  }
  return x
}

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        $allOperations({ args, query }) {
          return query(args).then(stringifyScalars)
        },
      },
    },
  })
}

declare const globalThis: {
  prisma: ReturnType<typeof prismaClientSingleton>
} & typeof global

const database = globalThis.prisma ?? prismaClientSingleton()

export default database

if (process.env.NODE_ENV !== "production") globalThis.prisma = database
