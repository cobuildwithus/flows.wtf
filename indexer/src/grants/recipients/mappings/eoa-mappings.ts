import { parentFlowToChildren, recipientAndParentToGrantId } from "ponder:schema"
import { Context } from "ponder:registry"

export async function handleRecipientMappings(
  db: Context["db"],
  recipient: string,
  flowContract: string,
  grantId: string
) {
  await Promise.all([
    db.insert(recipientAndParentToGrantId).values({
      recipientAndParent: `${recipient.toLowerCase()}-${flowContract.toLowerCase()}`,
      grantId,
    }),

    db.update(parentFlowToChildren, { parentFlowContract: flowContract }).set((row) => ({
      childGrantIds: [...row.childGrantIds, grantId],
    })),
  ])
}
