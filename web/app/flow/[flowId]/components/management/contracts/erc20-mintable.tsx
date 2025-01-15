import { ManagementCard } from "../management-card"
import { AddressForm } from "../forms"
import { base as baseContracts } from "@/addresses"
import { useUpgradeTokenEmitter } from "../../../hooks/useUpgradeTokenEmitter"

export const ERC20MintableManagement = ({
  erc20MintableAddress,
}: {
  erc20MintableAddress: `0x${string}`
}) => {
  const { upgradeTokenEmitter } = useUpgradeTokenEmitter(erc20MintableAddress)
  const erc20MintableImplementation = baseContracts.ERC20VotesMintableImpl

  return (
    <ManagementCard title="ERC20Mintable.sol" address={erc20MintableAddress}>
      <AddressForm
        title="Upgrade ERC20Mintable"
        functionName="upgradeTokenEmitter"
        placeholder="New erc20Mintable address"
        buttonText="Upgrade ERC20Mintable"
        onSubmit={upgradeTokenEmitter}
        prefill={erc20MintableImplementation}
      />
    </ManagementCard>
  )
}
