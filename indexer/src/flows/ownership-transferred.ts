import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"

ponder.on("CustomFlow:OwnershipTransferred", handleOwnershipTransferred)
ponder.on("NounsFlow:OwnershipTransferred", handleOwnershipTransferred)
ponder.on("NounsFlowChildren:OwnershipTransferred", handleOwnershipTransferred)

async function handleOwnershipTransferred(params: {
  event: Event<"CustomFlow:OwnershipTransferred">
  context: Context<"CustomFlow:OwnershipTransferred">
}) {
  const { event, context } = params
  const { newOwner } = event.args

  const grantId = event.log.address.toLowerCase()
  const grant = await context.db.find(grants, { id: grantId })
  if (!grant) {
    return
  }

  await context.db.update(grants, { id: grantId }).set({
    owner: newOwner.toLowerCase(),
  })
}

