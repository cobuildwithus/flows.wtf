import useSWR from "swr"
import { getDisputeVote } from "./get-disputes-votes"

export function useDisputeVote(
  disputeId: string,
  voter: string,
  arbitrator: string,
  skip?: boolean,
) {
  const { data, ...rest } = useSWR(
    skip ? undefined : `dispute_vote_${disputeId}_${voter}_${arbitrator}`,
    () => getDisputeVote(disputeId, voter, arbitrator),
  )

  return {
    disputeVote: data || null,
    ...rest,
  }
}
