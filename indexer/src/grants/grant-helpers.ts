import { Context } from "ponder:registry"
import { grants, flowContractAndRecipientIdToGrantId } from "ponder:schema"
import { zeroAddress } from "viem"

export async function addGrantIdToFlowContractAndRecipientId(
  db: Context["db"],
  flowContract: string,
  recipientId: string,
  grantId: string
) {
  const key = getId(flowContract, recipientId)
  const existing = await db.find(flowContractAndRecipientIdToGrantId, {
    flowContractAndRecipientId: key,
  })

  if (existing) {
    await db
      .update(flowContractAndRecipientIdToGrantId, { flowContractAndRecipientId: key })
      .set({ grantId })
  } else {
    await db.insert(flowContractAndRecipientIdToGrantId).values({
      flowContractAndRecipientId: key,
      grantId,
    })
  }
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

export function buildCanonicalRecipientGrantId(flowContract: string, recipientId: string) {
  return `${flowContract.toLowerCase()}-${recipientId}`
}

export async function calculateRootContract(
  db: Context["db"],
  contract: string,
  parentContract: string
) {
  if (parentContract === zeroAddress) return contract.toLowerCase()

  const parent = await db.find(grants, { id: parentContract.toLowerCase() })
  if (!parent) throw new Error(`Parent grant not found: ${parentContract}`)

  return parent.rootContract
}
