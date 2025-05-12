import { ponder, type Context, type Event } from "ponder:registry"
import { Status } from "../enums"
import { getAddress } from "viem"
import { removeApplicationEmbedding } from "./embeddings/embed-applications"
import { grants, tcrToGrantId } from "ponder:schema"
import { isBlockRecent } from "../utils"
import { getGrantIdFromTcrAndItemId } from "./helpers"

ponder.on("FlowTcr:ItemStatusChange", handleItemStatusChange)
ponder.on("FlowTcrChildren:ItemStatusChange", handleItemStatusChange)

async function handleItemStatusChange(params: {
  event: Event<"FlowTcr:ItemStatusChange">
  context: Context<"FlowTcr:ItemStatusChange">
}) {
  const { event, context } = params
  const { _itemID, _itemStatus, _disputed, _resolved } = event.args
  const isRecent = isBlockRecent(Number(event.block.timestamp))

  const parent = await context.db.find(tcrToGrantId, { tcr: event.log.address.toLowerCase() })
  if (!parent) throw new Error(`Parent grant not found: ${event.log.address.toLowerCase()}`)

  const grantId = await getGrantIdFromTcrAndItemId(context.db, parent.tcr, _itemID)
  if (!grantId) throw new Error(`Grant not found: ${_itemID}`)

  const grant = await context.db.find(grants, { id: grantId })
  if (!grant) throw new Error(`Grant not found: ${_itemID}`)

  let challengePeriodEndsAt = grant.challengePeriodEndsAt

  // Update challenge period end time if there is a removal request for this grant
  // Previously it was the end of application challenge period
  if (grant.status === Status.Registered && _itemStatus === Status.ClearingRequested) {
    const tcr = event.log.address.toLowerCase()

    const challengePeriodDuration = await context.client.readContract({
      address: getAddress(tcr),
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
    if (isRecent) await removeApplicationEmbedding(grant)
    await context.db.update(grants, { id: parent.grantId }).set((row) => ({
      awaitingRecipientCount: row.awaitingRecipientCount - 1,
    }))
  }

  if (grant.status === Status.RegistrationRequested && _itemStatus === Status.Registered) {
    await context.db.update(grants, { id: parent.grantId }).set((row) => ({
      awaitingRecipientCount: row.awaitingRecipientCount - 1,
      activeRecipientCount: row.activeRecipientCount + 1,
    }))
  }

  await context.db.update(grants, { id: grant.id }).set({
    status: _itemStatus,
    isDisputed: _disputed,
    isResolved: _resolved,
    challengePeriodEndsAt,
  })
}
