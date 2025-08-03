import { ponder, type Context, type Event } from "ponder:registry"
import { zeroAddress } from "viem"
import { grants } from "ponder:schema"

import { fetchTokenPriceWeiForToken, fetchEthUsdPrice } from "../utils/token-price"
import { USDC } from "../utils"

const BATCH_SIZE = 20

ponder.on("UnderlyingTokenPrices:block", handleTokenPrices)

async function handleTokenPrices(params: {
  event: Event<"UnderlyingTokenPrices:block">
  context: Context<"UnderlyingTokenPrices:block">
}) {
  const { context } = params
  const chainId = context.chain.id

  // Grab the current ETH → USD spot price
  const ethUsdPrice = await fetchEthUsdPrice()
  if (!ethUsdPrice) {
    console.error("[TokenPrices] Failed to fetch ETH/USD price – aborting run")
    return
  }

  // Fetch all grants on this chain that have an underlying ERC-20 token
  const grantsWithToken = await context.db.sql.query.grants.findMany({
    where: (tbl, { eq, ne }) =>
      eq(tbl.chainId, chainId) && ne(tbl.underlyingERC20Token, zeroAddress),
    columns: {
      id: true,
      underlyingERC20Token: true,
    },
  })

  if (grantsWithToken.length === 0) return

  // Collect unique token addresses to avoid redundant API requests
  const uniqueTokens = Array.from(
    new Set(grantsWithToken.map((g) => g.underlyingERC20Token.toLowerCase()))
  )

  // Fetch prices in parallel
  const tokenPriceMap = new Map<string, { ethWei: string; usd: string }>()

  await Promise.all(
    uniqueTokens.map(async (tokenAddr) => {
      // Special-case USDC – always $1
      if (tokenAddr === USDC.toLowerCase()) {
        const ethWei = BigInt(Math.round(1e18 / ethUsdPrice)).toString()
        tokenPriceMap.set(tokenAddr, { ethWei, usd: "1" })
        return
      }

      const ethPriceWei = await fetchTokenPriceWeiForToken(chainId, tokenAddr)
      if (!ethPriceWei) return

      const ethPriceNum = Number(ethPriceWei) / 1e18
      const usdPrice = (ethPriceNum * ethUsdPrice).toString()

      tokenPriceMap.set(tokenAddr, { ethWei: ethPriceWei, usd: usdPrice })
    })
  )

  // Persist back to DB in batches
  for (let i = 0; i < grantsWithToken.length; i += BATCH_SIZE) {
    const batch = grantsWithToken.slice(i, i + BATCH_SIZE)

    const updates = batch.map((grant) => {
      const info = tokenPriceMap.get(grant.underlyingERC20Token.toLowerCase())
      if (!info) return

      return context.db.update(grants, { id: grant.id }).set({
        underlyingTokenEthPrice: info.ethWei,
        underlyingTokenUsdPrice: info.usd,
      })
    })

    await Promise.all(updates)
  }
}
