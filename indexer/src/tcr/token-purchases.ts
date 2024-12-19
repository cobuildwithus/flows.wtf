import { ponder, type Context, type Event } from "ponder:registry"
import { tokenEmitterToErc20, tokenHolders } from "ponder:schema"

ponder.on("TokenEmitter:TokensBought", handleTokensBought)
ponder.on("TokenEmitterChildren:TokensBought", handleTokensBought)

async function handleTokensBought(params: {
  event: Event<"TokenEmitter:TokensBought">
  context: Context<"TokenEmitter:TokensBought">
}) {
  const { event, context } = params
  const { amount, cost, user } = event.args

  const holder = user.toLowerCase()

  const tokenEmitter = event.log.address.toLowerCase()
  const tokenEmitterRecord = await context.db.find(tokenEmitterToErc20, {
    tokenEmitter,
  })

  if (!tokenEmitterRecord) throw new Error("Token emitter not found")
  const erc20 = tokenEmitterRecord.erc20.toLowerCase()

  // Update token holder record with buy info
  await context.db.update(tokenHolders, { id: `${erc20}-${holder}` }).set((row) => ({
    totalBought: (BigInt(row.totalBought) + BigInt(amount)).toString(),
    costBasis: (BigInt(row.costBasis) + BigInt(cost)).toString(),
  }))
}
