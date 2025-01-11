import { NumberForm } from "../forms"
import { useImplementation } from "../../../hooks/useImplementation"
import { useVerifier } from "../../../hooks/useVerifier"
import { useUpgradeTo } from "../../../hooks/useUpgradeTo"
import { useSetFlowImpl } from "../../../hooks/useSetFlowImpl"
import { useUpdateVerifier } from "../../../hooks/useUpdateVerifier"
import { useSetFlowRate } from "../../../hooks/useSetFlowRate"
import { useFlowRate } from "../../../hooks/useFlowRate"
import { useSetBaselinePoolPercent } from "../../../hooks/useSetBaselinePoolPercent"
import { useBaselinePoolFlowRatePercent } from "../../../hooks/useBaselinePoolFlowRatePercent"
import { ManagementCard } from "../management-card"
import { AddressForm } from "../forms"
import { base as baseContracts } from "@/addresses"

export const FlowManagement = ({ flowAddress }: { flowAddress: `0x${string}` }) => {
  const implementation = useImplementation(flowAddress)
  const verifier = useVerifier(flowAddress)
  const { upgrade } = useUpgradeTo(flowAddress)
  const { setFlowImpl } = useSetFlowImpl(flowAddress)
  const { update } = useUpdateVerifier(flowAddress)
  const { setFlowRate } = useSetFlowRate(flowAddress)
  const flowRate = useFlowRate(flowAddress)
  const { setBaselinePoolPercent } = useSetBaselinePoolPercent(flowAddress)
  const baselinePoolFlowRatePercent = useBaselinePoolFlowRatePercent(flowAddress)

  return (
    <ManagementCard title="Flow.sol" address={flowAddress}>
      <AddressForm
        title="Upgrade Flow"
        prefill={baseContracts.NounsFlowImpl}
        functionName="upgradeTo"
        placeholder="New implementation address (0x...)"
        buttonText="Upgrade To"
        onSubmit={upgrade}
      />
      {implementation !== baseContracts.NounsFlowImpl && (
        <AddressForm
          title="Set Flow Implementation"
          prefill={baseContracts.NounsFlowImpl}
          functionName="setFlowImpl"
          placeholder="New implementation address (0x...)"
          buttonText="Set Flow Impl"
          onSubmit={setFlowImpl}
        />
      )}
      {verifier !== baseContracts.TokenVerifier && (
        <AddressForm
          title="Update Verifier"
          functionName="updateVerifier"
          placeholder="New verifier address (0x...)"
          buttonText="Update Flow Verifier"
          onSubmit={update}
          prefill={baseContracts.TokenVerifier}
        />
      )}
      <NumberForm
        title="Set Flow Rate"
        functionName="setFlowRate"
        placeholder="New flow rate"
        buttonText="Update Flow Rate"
        onSubmit={setFlowRate}
        prefill={flowRate ? Number(flowRate) : undefined}
      />
      <NumberForm
        title="Set Baseline Pool Percent"
        functionName="setBaselinePoolPercent"
        placeholder="New baseline pool flow rate percent"
        buttonText="Update Baseline Pool %"
        onSubmit={setBaselinePoolPercent}
        prefill={baselinePoolFlowRatePercent ? Number(baselinePoolFlowRatePercent) : undefined}
      />
    </ManagementCard>
  )
}
