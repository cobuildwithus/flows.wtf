import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"

import { fetchTokenPriceWeiForProject, fetchEthUsdPrice } from "../utils/token-price"

const BATCH_SIZE = 20

ponder.on("FundraisingTokenPrices:block", handleTokenPrices)

async function handleTokenPrices(params: {
  event: Event<"FundraisingTokenPrices:block">
  context: Context<"FundraisingTokenPrices:block">
}) {
  const { context } = params
  const chainId = context.chain.id

  // Grab the current ETH → USD spot price
  const ethUsdPrice = await fetchEthUsdPrice()
  if (!ethUsdPrice) {
    console.error("[TokenPrices] Failed to fetch ETH/USD price – aborting run")
    return
  }

  // Fetch all grants on this chain that have a JBX project ID
  const grantsWithToken = await context.db.sql.query.grants.findMany({
    where: (tbl, { eq }) => eq(tbl.chainId, chainId),
    columns: {
      id: true,
      jbxProjectId: true,
      jbxChainId: true,
    },
  })

  const filteredGrants = grantsWithToken.filter((g) => g.jbxProjectId !== null)

  if (filteredGrants.length === 0) return

  // Collect unique JBX projects to avoid redundant API requests
  const uniqueJbxProjects = Array.from(
    new Set(
      filteredGrants
        .filter((g) => g.jbxProjectId !== null && g.jbxChainId !== null)
        .map((g) => `${g.jbxChainId}:${g.jbxProjectId}`)
    )
  )

  if (uniqueJbxProjects.length === 0 && chainId === 8453) throw new Error("stop")

  // Fetch prices in parallel
  const jbxProjectPriceMap = new Map<string, { ethWei: string; usd: string }>()

  await Promise.all([
    // Fetch JBX project prices
    ...uniqueJbxProjects.map(async (projectKey) => {
      const [jbxChainId, projectId] = projectKey.split(":")

      const ethPriceWei = await fetchTokenPriceWeiForProject(Number(jbxChainId), Number(projectId))

      if (!ethPriceWei) return

      const ethPriceNum = Number(ethPriceWei) / 1e18
      const usdPrice = (ethPriceNum * ethUsdPrice).toString()

      jbxProjectPriceMap.set(projectKey, { ethWei: ethPriceWei, usd: usdPrice })
    }),
  ])

  // Persist back to DB in batches
  for (let i = 0; i < filteredGrants.length; i += BATCH_SIZE) {
    const batch = filteredGrants.slice(i, i + BATCH_SIZE)

    const updatesFundraising = batch.map((grant) => {
      if (grant.jbxProjectId === null || grant.jbxChainId === null) return

      const projectKey = `${grant.jbxChainId}:${grant.jbxProjectId}`
      const info = jbxProjectPriceMap.get(projectKey)

      if (!info) return

      return context.db.update(grants, { id: grant.id }).set({
        fundraisingTokenEthPrice: info.ethWei,
        fundraisingTokenUsdPrice: info.usd,
      })
    })

    const updates = updatesFundraising.filter(Boolean)

    if (updates.length === 0) continue

    await Promise.all(updates)
  }
}
