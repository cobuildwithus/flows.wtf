import { Context } from "ponder:registry"
import { grants } from "ponder:schema"

export async function getFlow(db: Context["db"], id: string) {
  const flow = await db.find(grants, { id })
  if (!flow) throw new Error("Flow not found")

  return flow
}

export function isOnchainStartup(flowContract: string) {
  const acceleratorFlows = ["0xca1d9e8a93f316ef7e6f880116a160333d085f92"]

  return acceleratorFlows.includes(flowContract)
}
