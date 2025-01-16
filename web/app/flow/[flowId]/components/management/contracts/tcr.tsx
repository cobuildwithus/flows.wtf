import { useChangeChallengeDuration } from "../../../hooks/useChangeChallengeDuration"
import { useChallengeTimeDuration } from "../../../hooks/useChallengeTimeDuration"
import { ManagementCard } from "../management-card"
import { NumberForm } from "../forms"

export const TCRManagement = ({ tcrAddress }: { tcrAddress: `0x${string}` }) => {
  const { changeDuration } = useChangeChallengeDuration(tcrAddress)
  const duration = useChallengeTimeDuration(tcrAddress)

  return (
    <ManagementCard title="FlowTCR.sol" address={tcrAddress}>
      <NumberForm
        title="Change Challenge Duration"
        functionName="challengePeriodDuration"
        placeholder="New challenge period duration in seconds"
        buttonText="Update Challenge Duration"
        onSubmit={changeDuration}
        prefill={duration ? Number(duration) : undefined}
      />
    </ManagementCard>
  )
}
