import { Context } from "ponder:registry"
import { grants } from "ponder:schema"
import { accelerators, startupsToJbxBaseProjectId } from "../../../addresses"

export async function getFlow(db: Context["db"], id: string) {
  const flow = await db.find(grants, { id })
  if (!flow) throw new Error("Flow not found")

  return flow
}

export function isOnchainStartup(parentFlow: string) {
  return isAccelerator(parentFlow)
}

export function isAccelerator(id: string) {
  return Object.values(accelerators).some((addr) => addr.toLowerCase() === id.toLowerCase())
}

export function revnetProjectChainId(flow: string): number | null {
  const projectId = startupsToJbxBaseProjectId[flow as keyof typeof startupsToJbxBaseProjectId]

  return projectId
}
