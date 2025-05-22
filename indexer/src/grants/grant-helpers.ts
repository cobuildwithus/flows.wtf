import { Context } from "ponder:registry"
import { flowContractAndRecipientIdToGrantId } from "ponder:schema"

export async function addGrantIdToFlowContractAndRecipientId(
  db: Context["db"],
  flowContract: string,
  recipientId: string,
  grantId: string
) {
  await db.insert(flowContractAndRecipientIdToGrantId).values({
    flowContractAndRecipientId: getId(flowContract, recipientId),
    grantId,
  })
}

export async function getGrantIdFromFlowContractAndRecipientId(
  db: Context["db"],
  flowContract: string,
  recipientId: string
) {
  const result = await db.find(flowContractAndRecipientIdToGrantId, {
    flowContractAndRecipientId: getId(flowContract, recipientId),
  })
  if (!result) throw new Error("Grant ID not found for flow contract and recipient ID")
  return result.grantId
}

const getId = (flowContract: string, recipientId: string) =>
  `${flowContract.toLowerCase()}-${recipientId}`
