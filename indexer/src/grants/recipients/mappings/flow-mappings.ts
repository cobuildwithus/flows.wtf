import { bonusPoolToGrantId, parentFlowToChildren } from "ponder:schema"
import { baselinePoolToGrantId } from "ponder:schema"
import { Context } from "ponder:registry"
import { flowContractToGrantId } from "ponder:schema"

export async function createFlowMappings(
  db: Context["db"],
  flowContract: string,
  grantId: string,
  bonusPool: string,
  baselinePool: string
) {
  await Promise.all([
    db.insert(flowContractToGrantId).values({
      contract: flowContract,
      grantId,
    }),
    db.insert(bonusPoolToGrantId).values({
      bonusPool: bonusPool.toLowerCase(),
      grantId,
    }),
    db.insert(baselinePoolToGrantId).values({
      baselinePool: baselinePool.toLowerCase(),
      grantId,
    }),
    db.insert(parentFlowToChildren).values({
      parentFlowContract: flowContract,
      childGrantIds: [],
    }),
  ])
}
