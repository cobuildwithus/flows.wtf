import {
  type grants,
  type allocations,
  type disputes,
  type disputeVotes,
  type tokenHolders,
  type evidence,
} from "ponder:schema"

export type Grant = typeof grants.$inferSelect
export type Allocation = typeof allocations.$inferSelect
export type Dispute = typeof disputes.$inferSelect
export type DisputeVote = typeof disputeVotes.$inferSelect
export type TokenHolder = typeof tokenHolders.$inferSelect
export type Evidence = typeof evidence.$inferSelect
