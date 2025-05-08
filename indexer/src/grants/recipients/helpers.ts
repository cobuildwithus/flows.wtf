import { Context } from "ponder:registry"
import { grants } from "ponder:schema"

export async function getParentFlow(db: Context["db"], parentFlow: string) {
  const flow = await db.find(grants, { id: parentFlow })
  if (!flow) throw new Error("Flow not found for recipient")

  return flow
}
