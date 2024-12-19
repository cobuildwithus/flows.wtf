import { ponder, type Context, type Event } from "ponder:registry"
import { tokenEmitterToErc20, tokenHolders } from "ponder:schema"

ponder.on("TokenEmitter:TokensSold", handleTokensSold)
ponder.on("TokenEmitterChildren:TokensSold", handleTokensSold)

async function handleTokensSold(params: {
  event: Event<"TokenEmitter:TokensSold">
  context: Context<"TokenEmitter:TokensSold">
}) {
  const { event, context } = params
  const { amount, payment, seller } = event.args

  const holder = seller.toLowerCase()

  const tokenEmitter = event.log.address.toLowerCase()
  const tokenEmitterRecord = await context.db.find(tokenEmitterToErc20, {
    tokenEmitter,
  })

  if (!tokenEmitterRecord) throw new Error("Token emitter not found")
  const erc20 = tokenEmitterRecord.erc20.toLowerCase()

  // Update token holder record with sell info
  await context.db.update(tokenHolders, { id: `${erc20}-${holder}` }).set((row) => ({
    totalSold: (BigInt(row.totalSold) + BigInt(amount)).toString(),
    totalSaleProceeds: (BigInt(row.totalSaleProceeds) + BigInt(payment)).toString(),
  }))
}
