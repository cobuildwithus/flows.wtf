import { useUpgradeArbitrator } from "../../../hooks/useUpgradeArbitrator"
import { ManagementCard } from "../management-card"
import { AddressForm } from "../forms"
import { base as baseContracts } from "@/addresses"

export const ArbitratorManagement = ({
  arbitratorAddress,
}: {
  arbitratorAddress?: `0x${string}`
}) => {
  const { upgradeArbitrator } = useUpgradeArbitrator(arbitratorAddress)
  const arbitratorImplementation = baseContracts.ERC20VotesArbitratorImpl

  if (!arbitratorAddress) return null

  return (
    <ManagementCard title="ERC20VotesArbitrator.sol" address={arbitratorAddress}>
      <AddressForm
        title="Upgrade Arbitrator"
        functionName="upgradeTo"
        placeholder="New arbitrator implementation address (0x...)"
        buttonText="Upgrade Arbitrator"
        onSubmit={upgradeArbitrator}
        prefill={arbitratorImplementation as `0x${string}`}
      />
    </ManagementCard>
  )
}
