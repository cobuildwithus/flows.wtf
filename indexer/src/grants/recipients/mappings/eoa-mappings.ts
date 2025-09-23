import { parentFlowToChildren, recipientAndParentToGrantId } from "ponder:schema"
import { Context } from "ponder:registry"

export async function handleRecipientMappings(
  db: Context["db"],
  recipient: string,
  flowContract: string,
  grantId: string
) {
  const key = `${recipient.toLowerCase()}-${flowContract.toLowerCase()}`

  const existing = await db.find(recipientAndParentToGrantId, {
    recipientAndParent: key,
  })

  if (existing) {
    await db.update(recipientAndParentToGrantId, { recipientAndParent: key }).set({ grantId })
  } else {
    await db.insert(recipientAndParentToGrantId).values({
      recipientAndParent: key,
      grantId,
    })
  }

  await db.update(parentFlowToChildren, { parentFlowContract: flowContract }).set((row) => ({
    childGrantIds: row.childGrantIds.includes(grantId)
      ? row.childGrantIds
      : [...row.childGrantIds, grantId],
  }))
}
