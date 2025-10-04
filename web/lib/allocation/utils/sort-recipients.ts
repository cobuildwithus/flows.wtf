export function sortRecipientsAndAllocations(
  recipientIds: `0x${string}`[],
  scaledAllocations: number[],
) {
  const pairs = recipientIds.map((id, i) => ({ id, alloc: scaledAllocations[i] }))
  pairs.sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : BigInt(a.id) > BigInt(b.id) ? 1 : 0))
  return {
    recipientIds: pairs.map((p) => p.id),
    percentAllocations: pairs.map((p) => p.alloc),
  }
}
