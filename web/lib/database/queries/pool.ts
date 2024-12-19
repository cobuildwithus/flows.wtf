import database, { getCacheStrategy } from "@/lib/database/edge"

export const getPool = async () => {
  return await database.grant.findFirstOrThrow({
    where: { isTopLevel: true, isFlow: true },
    ...getCacheStrategy(604800), // 7 days in seconds
  })
}
