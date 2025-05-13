import { Context } from "ponder:registry"
import { grants } from "ponder:schema"

export async function getFlow(db: Context["db"], id: string) {
  const flow = await db.find(grants, { id })
  if (!flow) throw new Error("Flow not found")

  return flow
}
