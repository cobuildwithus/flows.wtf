import { Context } from "ponder:registry"
import { tcrAndItemIdToGrantId } from "ponder:schema"

export async function addGrantIdToTcrAndItemId(
  db: Context["db"],
  tcr: string,
  itemId: string,
  grantId: string
) {
  await db.insert(tcrAndItemIdToGrantId).values({
    tcrAndItemId: `${tcr.toLowerCase()}-${itemId}`,
    grantId,
  })
}

export async function updateTcrAndItemId(
  db: Context["db"],
  tcr: string,
  itemId: string,
  grantId: string
) {
  await db
    .update(tcrAndItemIdToGrantId, {
      tcrAndItemId: `${tcr.toLowerCase()}-${itemId}`,
    })
    .set({
      grantId,
    })
}

export async function getGrantIdFromTcrAndItemId(db: Context["db"], tcr: string, itemId: string) {
  const result = await db.find(tcrAndItemIdToGrantId, {
    tcrAndItemId: `${tcr.toLowerCase()}-${itemId}`,
  })
  if (!result) throw new Error("Grant ID not found for TCR and item ID")
  return result.grantId
}
