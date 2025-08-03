import database from "@/lib/database/flows-db"

export async function getJuiceboxProjectForStartup(chainId: number, projectId: number) {
  const project = await database.juiceboxProject.findUnique({
    where: {
      chainId_projectId: {
        chainId,
        projectId,
      },
    },
    select: {
      accountingToken: true,
      accountingDecimals: true,
      currentRulesetId: true,
    },
  })

  if (!project) return null

  // Get active ruleset if available
  let activeRuleset = null
  let nextPriceIncrease = null

  if (project.currentRulesetId !== BigInt(0)) {
    activeRuleset = await database.juiceboxRuleset.findUnique({
      where: {
        chainId_projectId_rulesetId: {
          chainId,
          projectId,
          rulesetId: project.currentRulesetId,
        },
      },
      select: {
        duration: true,
        start: true,
      },
    })

    // Calculate time until next price increase
    if (activeRuleset && activeRuleset.duration !== BigInt(0)) {
      const now = Math.floor(Date.now() / 1000)
      const duration = Number(activeRuleset.duration)
      const elapsed = now - Number(activeRuleset.start)
      const cyclesPassed = Math.floor(elapsed / duration)
      const nextCycleStart = Number(activeRuleset.start) + (cyclesPassed + 1) * duration
      const secondsUntilNext = Math.max(nextCycleStart - now, 0)

      if (secondsUntilNext > 0) {
        nextPriceIncrease = new Date((now + secondsUntilNext) * 1000)
      }
    }
  }

  return {
    ...project,
    activeRuleset,
    nextPriceIncrease,
  }
}
