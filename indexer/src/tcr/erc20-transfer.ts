import { ponder, type Context, type Event } from "ponder:registry"
import { zeroAddress } from "viem"
import { tokenHolders } from "ponder:schema"

ponder.on("Erc20Token:Transfer", handleTransfer)
ponder.on("Erc20TokenChildren:Transfer", handleTransfer)

async function handleTransfer(params: {
  event: Event<"Erc20Token:Transfer">
  context: Context<"Erc20Token:Transfer">
}) {
  const { event, context } = params
  const { value } = event.args

  const tokenContract = event.log.address.toLowerCase()
  const from = event.args.from.toLowerCase()
  const to = event.args.to.toLowerCase()

  // Decrease the amount from the sender
  if (from !== zeroAddress) {
    await context.db.update(tokenHolders, { id: `${tokenContract}-${from}` }).set((row) => ({
      amount: (BigInt(row.amount) - value).toString(),
    }))
  }

  // Increase the amount for the receiver
  if (to !== zeroAddress) {
    await context.db
      .insert(tokenHolders)
      .values({
        id: `${tokenContract}-${to}`,
        tokenContract,
        holder: to,
        amount: value.toString(),
        firstPurchase: Number(event.block.timestamp),
        totalBought: "0",
        totalSold: "0",
        costBasis: "0",
        totalSaleProceeds: "0",
      })
      .onConflictDoUpdate((row) => ({
        amount: (BigInt(row.amount) + value).toString(),
      }))
  }
}
