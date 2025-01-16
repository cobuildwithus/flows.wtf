import { ManagementCard } from "../management-card"
import { AddressForm } from "../forms"
import { base as baseContracts } from "@/addresses"
import { useUpgradeTokenEmitter } from "../../../hooks/useUpgradeTokenEmitter"

export const TokenEmitterManagement = ({
  tokenEmitterAddress,
}: {
  tokenEmitterAddress: `0x${string}`
}) => {
  const { upgradeTokenEmitter } = useUpgradeTokenEmitter(tokenEmitterAddress)
  const tokenEmitterImplementation = baseContracts.TokenEmitterImpl

  return (
    <ManagementCard title="TokenEmitter.sol" address={tokenEmitterAddress}>
      <AddressForm
        title="Upgrade Token Emitter"
        functionName="upgradeTokenEmitter"
        placeholder="New token emitter address"
        buttonText="Upgrade Token Emitter"
        onSubmit={upgradeTokenEmitter}
        prefill={tokenEmitterImplementation}
      />
    </ManagementCard>
  )
}
