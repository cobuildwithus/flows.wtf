import { Context } from "ponder:registry"
import { flowContractToGrantId, grants } from "ponder:schema"

export async function getParentFlow(db: Context["db"], parentFlow: string) {
  const flowGrantId = await db.find(flowContractToGrantId, { contract: parentFlow })
  if (!flowGrantId) throw new Error("Flow not found for recipient")

  const flow = await db.find(grants, { id: flowGrantId.grantId })
  if (!flow) throw new Error("Flow not found for recipient")

  return flow
}
