import { ponder, type Context, type Event } from "ponder:registry"
import { Status } from "../enums"
import { getAddress } from "viem"
import { grants, tcrToGrantId } from "ponder:schema"
import { tryGetGrantIdFromTcrAndItemId } from "./tcr-helpers"
import { getGrantIdFromFlowContractAndRecipientId } from "../grants/grant-helpers"

ponder.on("FlowTcr:ItemStatusChange", handleItemStatusChange)
ponder.on("FlowTcrChildren:ItemStatusChange", handleItemStatusChange)

async function handleItemStatusChange(params: {
  event: Event<"FlowTcr:ItemStatusChange">
  context: Context<"FlowTcr:ItemStatusChange">
}) {
  const { event, context } = params
  const { _itemID, _itemStatus, _disputed, _resolved } = event.args
  const itemId = _itemID.toLowerCase()

  const tcr = event.log.address.toLowerCase()
  const parent = await context.db.find(tcrToGrantId, { tcr })
  if (!parent) {
    console.error(`[ItemStatusChange] Parent grant not found for TCR ${tcr}`)
    return
  }

  let grantId = await tryGetGrantIdFromTcrAndItemId(context.db, parent.tcr, itemId)
  if (!grantId) {
    try {
      grantId = await getGrantIdFromFlowContractAndRecipientId(context.db, parent.grantId, itemId)
    } catch (err) {
      console.error(
        `[ItemStatusChange] Grant ID not found for tcr=${parent.tcr} itemId=${itemId} (flow fallback failed)`,
        err
      )
      return
    }
  }

  const grant = await context.db.find(grants, { id: grantId })
  if (!grant) {
    console.error(`[ItemStatusChange] Grant row not found for id=${grantId} (itemId=${itemId})`)
    return
  }

  let challengePeriodEndsAt = grant.challengePeriodEndsAt

  // Update challenge period end time if there is a removal request for this grant
  // Previously it was the end of application challenge period
  if (grant.status === Status.Registered && _itemStatus === Status.ClearingRequested) {
    const challengePeriodDuration = await context.client.readContract({
      address: getAddress(parent.tcr),
      abi: context.contracts.FlowTcr.abi,
      functionName: "challengePeriodDuration",
    })

    challengePeriodEndsAt = Number(event.block.timestamp + challengePeriodDuration)
  }

  if (!grant.isActive && _itemStatus === Status.RegistrationRequested) {
    await context.db.update(grants, { id: parent.grantId }).set((row) => ({
      awaitingRecipientCount: row.awaitingRecipientCount + 1,
    }))
  }

  if (grant.status === Status.RegistrationRequested && _itemStatus === Status.Absent) {
    await context.db.update(grants, { id: parent.grantId }).set((row) => ({
      awaitingRecipientCount: row.awaitingRecipientCount - 1,
    }))
  }

  if (grant.status === Status.RegistrationRequested && _itemStatus === Status.Registered) {
    await context.db.update(grants, { id: parent.grantId }).set((row) => ({
      awaitingRecipientCount: row.awaitingRecipientCount - 1,
    }))
  }

  await context.db.update(grants, { id: grant.id }).set({
    status: _itemStatus,
    isDisputed: _disputed,
    isResolved: _resolved,
    challengePeriodEndsAt,
  })
}
