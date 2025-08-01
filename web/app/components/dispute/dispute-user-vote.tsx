"use client"

import { erc20VotesArbitratorImplAbi } from "@/lib/abis"
import { useDisputeVote } from "@/lib/tcr/dispute/use-dispute-votes"
import { useArbitratorData } from "@/lib/tcr/use-arbitrator-data"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Dispute, DisputeVote, Grant } from "@prisma/flows"
import { ThickArrowDownIcon, ThickArrowUpIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { formatEther } from "viem"
import { useSecretVoteHash } from "./useSecretVoteHash"
import type { User } from "@/lib/auth/user"
import { AuthButton } from "@/components/ui/auth-button"

interface Props {
  grant: Grant
  dispute: Dispute
  user?: User
}

export function DisputeUserVote(props: Props) {
  const { grant, dispute, user } = props
  const router = useRouter()
  const address = user?.address
  const [canVote, setCanVote] = useState(false)

  const mirrored = grant.isActive

  const { disputeVote, mutate } = useDisputeVote(
    dispute.disputeId,
    address!,
    dispute.arbitrator,
    !address,
  )

  const { canVote: canVoteOnchain, votingPower } = useArbitratorData(
    dispute.arbitrator as `0x${string}`,
    dispute.disputeId,
    dispute.chainId,
    address!,
  )

  const {
    forCommitHash,
    againstCommitHash,
    error,
    isLoading: isLoadingSecretVoteHash,
  } = useSecretVoteHash(dispute.arbitrator, dispute.disputeId, grant.chainId, address)

  const { writeContract, prepareWallet, isLoading, toastId } = useContractTransaction({
    onSuccess: () => {
      setTimeout(() => {
        router.refresh()
        mutate()
      }, 1000)
    },
    chainId: grant.chainId,
  })

  const hasVoted = !!disputeVote
  const isVotingClosed = new Date() > new Date(dispute.votingEndTime * 1000)
  const isVotingOpen = new Date() > new Date(dispute.votingStartTime * 1000) && !isVotingClosed

  useEffect(() => {
    setCanVote(isVotingOpen && !hasVoted && !!address && canVoteOnchain)
  }, [isVotingOpen, hasVoted, address, canVoteOnchain])

  if (hasVoted) {
    if (!disputeVote.choice && new Date() > new Date(dispute.revealPeriodEndTime * 1000)) {
      return <UnrevealedVote />
    }
    if (disputeVote.choice) {
      return <RevealedVote disputeVote={disputeVote} grant={grant} />
    }

    return <CommittedVote />
  }

  if (isVotingClosed) {
    return (
      <div className="text-sm text-muted-foreground">
        Voting is over. You didn&apos;t vote in this dispute.
      </div>
    )
  }

  return (
    <div>
      <div className="flex space-x-4">
        <AuthButton
          disabled={(isLoading || !canVote) && !!user}
          loading={isLoading}
          className="grow"
          type="button"
          onClick={async () => {
            try {
              if (isLoadingSecretVoteHash)
                return toast.info("Generating vote hashes...", { id: toastId })
              if (error) return toast.error(error.message, { id: toastId })
              if (!forCommitHash || !againstCommitHash) throw new Error("No secret hash")
              await prepareWallet()

              writeContract({
                address: getEthAddress(dispute.arbitrator),
                abi: erc20VotesArbitratorImplAbi,
                functionName: "commitVote",
                args: [BigInt(dispute.disputeId), mirrored ? againstCommitHash : forCommitHash],
                chainId: grant.chainId,
              })
            } catch (e: any) {
              toast.error(e.message, { id: toastId })
            }
          }}
        >
          <ThickArrowUpIcon className="mr-2 size-4" />
          {mirrored ? "Keep" : "Approve"} {grant.isFlow ? "flow" : "grant"}
        </AuthButton>

        <AuthButton
          disabled={(isLoading || !canVote) && !!user}
          loading={isLoading}
          type="button"
          className="grow"
          onClick={async () => {
            try {
              if (isLoadingSecretVoteHash)
                return toast.info("Generating vote hashes...", { id: toastId })
              if (error) return toast.error(error.message, { id: toastId })
              if (!againstCommitHash || !forCommitHash) throw new Error("No secret hash")
              await prepareWallet()

              writeContract({
                address: getEthAddress(dispute.arbitrator),
                abi: erc20VotesArbitratorImplAbi,
                functionName: "commitVote",
                args: [BigInt(dispute.disputeId), mirrored ? forCommitHash : againstCommitHash],
                chainId: grant.chainId,
              })
            } catch (e: any) {
              toast.error(e.message, { id: toastId })
            }
          }}
        >
          {mirrored ? "Remove" : "Reject"} {grant.isFlow ? "flow" : "grant"}
          <ThickArrowDownIcon className="ml-2 size-4" />
        </AuthButton>
      </div>
      {!isVotingOpen && (
        <div className="mt-3 text-center text-xs text-muted-foreground">
          Voting is not open yet.
        </div>
      )}
      {!canVoteOnchain && (
        <div className="mt-3 text-center text-xs text-muted-foreground">
          You didn&apos;t have enough voting power when this dispute was created to vote.
        </div>
      )}
      {canVoteOnchain && canVote && (
        <div className="mt-3 text-center text-xs text-muted-foreground">
          Vote with {formatEther(votingPower)} votes.
        </div>
      )}
    </div>
  )
}

const UnrevealedVote = () => (
  <div className="space-y-4 text-sm">
    <h3 className="font-medium text-muted-foreground">Your vote was not revealed in time</h3>
    <p className="text-muted-foreground">
      This is a bug on our side. Please contact rocketman ASAP.
    </p>
  </div>
)

const RevealedVote = ({ disputeVote, grant }: { disputeVote: DisputeVote; grant: Grant }) => {
  const mirrored = grant.isActive

  return (
    <div className="space-y-4 text-sm text-muted-foreground">
      <p>
        You voted{" "}
        <b
          className={`capitalize ${disputeVote.choice === (mirrored ? 2 : 1) ? "text-green-500" : "text-red-500"}`}
        >
          {disputeVote.choice === 1 ? "for" : "against"}
        </b>{" "}
        {grant.isActive ? "removing" : "approving"} this {grant.isFlow ? "flow" : "grant"} with{" "}
        {disputeVote.votes} votes.
      </p>
    </div>
  )
}

const CommittedVote = () => (
  <div className="space-y-4 text-sm">
    <h3 className="font-medium">You have successfully committed your vote</h3>
    <p className="text-muted-foreground">
      TCRs use commit-reveal voting. You have committed your vote onchain.
    </p>
    <p className="text-muted-foreground">
      For your convenience, we store your vote encrypted in a database. Your vote will be revealed
      automatically at the end of the voting period.
    </p>
    <p className="text-muted-foreground">You can opt out of custodial voting soon.</p>
  </div>
)
