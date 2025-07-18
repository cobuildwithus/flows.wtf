import database from "@/lib/database/flows-db"

export async function getJuiceboxProjectForStartup(chainId: number, projectId: number) {
  return await database.juiceboxProject.findUnique({
    where: {
      chainId_projectId: {
        chainId,
        projectId,
      },
    },
    select: {
      accountingToken: true,
      accountingDecimals: true,
    },
  })
}
