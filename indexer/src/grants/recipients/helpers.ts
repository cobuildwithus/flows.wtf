import { Context } from "ponder:registry"
import { grants } from "ponder:schema"
import { accelerators } from "../../../addresses"

export async function getFlow(db: Context["db"], id: string) {
  const flow = await db.find(grants, { id })
  if (!flow) throw new Error("Flow not found")

  return flow
}

export function isOnchainStartup(flowContract: string) {
  return !isAccelerator(flowContract)
}

export function isAccelerator(id: string) {
  return Object.values(accelerators).some((addr) => addr.toLowerCase() === id.toLowerCase())
}
