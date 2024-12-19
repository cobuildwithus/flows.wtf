"use client"

import { Button } from "@/components/ui/button"

import { FlowWithGrants } from "@/lib/database/queries/flow"
import { useIsFlowOwner } from "../hooks/useIsFlowOwner"
import { explorerUrl, getEthAddress } from "@/lib/utils"
import { useUpgradeTo } from "../hooks/useUpgradeTo"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useUpdateVerifier } from "../hooks/useUpdateVerifier"
import { base as baseContracts } from "@/addresses"
import { useImplementation } from "../hooks/useImplementation"
import { useSetFlowImpl } from "../hooks/useSetFlowImpl"
import { useVerifier } from "../hooks/useVerifier"
import { useChangeChallengeDuration } from "../hooks/useChangeChallengeDuration"
import { useChallengeTimeDuration } from "../hooks/useChallengeTimeDuration"
import { useSetFlowRate } from "../hooks/useSetFlowRate"
import { useFlowRate } from "../hooks/useFlowRate"
import { useSetBaselinePoolPercent } from "../hooks/useSetBaselinePoolPercent"
import { useBaselinePoolFlowRatePercent } from "../hooks/useBaselinePoolFlowRatePercent"
import { useUpgradeArbitrator } from "../hooks/useUpgradeArbitrator"
import { useArbitrator } from "../hooks/useArbitrator"
import Link from "next/link"
import { base } from "viem/chains"

interface Props {
  flow: FlowWithGrants
}

interface AddressFormProps {
  title: string
  functionName: string
  placeholder: string
  prefill?: string
  buttonText: string
  onSubmit: (address: `0x${string}`) => Promise<void>
}

export const ManageFlow = ({ flow }: Props) => {
  const flowAddress = getEthAddress(flow.recipient)
  const tcrAddress = getEthAddress(flow.tcr)
  const isFlowOwner = useIsFlowOwner(flowAddress)
  const arbitratorAddress = useArbitrator(tcrAddress)
  const implementation = useImplementation(flowAddress)
  const verifier = useVerifier(flowAddress)
  const { upgrade } = useUpgradeTo(flowAddress)
  const { setFlowImpl } = useSetFlowImpl(flowAddress)
  const { update } = useUpdateVerifier(flowAddress)
  const { changeDuration } = useChangeChallengeDuration(tcrAddress)
  const duration = useChallengeTimeDuration(tcrAddress)
  const { setFlowRate } = useSetFlowRate(flowAddress)
  const flowRate = useFlowRate(flowAddress)
  const { setBaselinePoolPercent } = useSetBaselinePoolPercent(flowAddress)
  const baselinePoolFlowRatePercent = useBaselinePoolFlowRatePercent(flowAddress)
  const { upgradeArbitrator } = useUpgradeArbitrator(arbitratorAddress)
  const arbitratorImplementation = baseContracts.ERC20VotesArbitratorImpl

  if (!isFlowOwner) return null

  return (
    <div className="border-t pt-2">
      <p className="mb-2 text-sm font-medium">Manage Flow</p>

      <div className="space-y-4">
        {/* Contract Upgrades */}
        <AddressForm
          title="Upgrading"
          prefill={baseContracts.NounsFlowImpl}
          functionName="upgradeTo"
          placeholder="New implementation address (0x...)"
          buttonText="Upgrade To"
          onSubmit={upgrade}
        />
        {implementation !== baseContracts.NounsFlowImpl && (
          <AddressForm
            title="Deployed implementation"
            prefill={baseContracts.NounsFlowImpl}
            functionName="setFlowImpl"
            placeholder="New implementation address (0x...)"
            buttonText="Set Flow Impl"
            onSubmit={setFlowImpl}
          />
        )}

        {/* Update Verifier */}
        {verifier !== baseContracts.TokenVerifier && (
          <AddressForm
            title="Updating"
            functionName="updateVerifier"
            placeholder="New verifier address (0x...)"
            buttonText="Update Flow Verifier"
            onSubmit={update}
            prefill={baseContracts.TokenVerifier}
          />
        )}

        {/* Flow Rate */}
        <NumberForm
          title="Flow Rate"
          functionName="setFlowRate"
          placeholder="New flow rate"
          buttonText="Update Flow Rate"
          onSubmit={setFlowRate}
          prefill={flowRate ? Number(flowRate) : undefined}
        />

        <NumberForm
          title="Baseline Pool Flow Rate Percent"
          functionName="setBaselinePoolPercent"
          placeholder="New baseline pool flow rate percent"
          buttonText="Update Baseline Pool Flow Rate Percent"
          onSubmit={setBaselinePoolPercent}
          prefill={baselinePoolFlowRatePercent ? Number(baselinePoolFlowRatePercent) : undefined}
        />

        {/* Future sections for other contract interactions can be added here */}
      </div>

      <div className="space-y-3">
        <p className="mt-4 text-sm font-medium">Manage TCR</p>
        <ViewOnExplorer address={tcrAddress} />
        <div className="space-y-4">
          <NumberForm
            title="Change Challenge Duration"
            functionName="challengePeriodDuration"
            placeholder="New challenge period duration in seconds"
            buttonText="Update Challenge Duration"
            onSubmit={changeDuration}
            prefill={duration ? Number(duration) : undefined}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="mt-4 text-sm font-medium">Manage Arbitrator</p>
        <ViewOnExplorer address={arbitratorAddress} />
        <div className="space-y-4">
          <AddressForm
            title="Upgrade Arbitrator Implementation"
            functionName="upgradeTo"
            placeholder="New arbitrator implementation address (0x...)"
            buttonText="Upgrade Arbitrator"
            onSubmit={upgradeArbitrator}
            prefill={arbitratorImplementation as `0x${string}`}
          />
        </div>
      </div>
    </div>
  )
}

const ViewOnExplorer = ({ address }: { address?: `0x${string}` }) => {
  if (!address) return null

  return (
    <Link
      className="text-xs underline"
      href={explorerUrl(address, base.id, "address")}
      target="_blank"
    >
      View on Explorer
    </Link>
  )
}

const FormField = ({
  title,
  functionName,
  buttonText,
  onSubmit,
  isSubmitting,
  children,
}: {
  title: string
  functionName: string
  buttonText: string
  onSubmit: (e: React.FormEvent) => Promise<void>
  isSubmitting: boolean
  children: React.ReactNode
}) => {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        <code>{functionName}</code>
      </p>
      <form className="space-y-2" onSubmit={onSubmit}>
        {children}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? `${title}...` : buttonText}
        </Button>
      </form>
    </div>
  )
}

const NumberForm = ({
  title,
  functionName,
  placeholder,
  buttonText,
  onSubmit,
  prefill,
}: {
  title: string
  functionName: string
  placeholder: string
  buttonText: string
  onSubmit: (value: number) => Promise<void>
  prefill?: number
}) => {
  const [number, setNumber] = useState<string>(prefill?.toString() || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(Number(number))
    } catch (error) {
      console.error(error)
    }
    setIsSubmitting(false)
  }

  return (
    <FormField
      title={title}
      functionName={functionName}
      buttonText={buttonText}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <Input
        type="number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder={placeholder}
        className="text-sm"
        disabled={isSubmitting}
      />
    </FormField>
  )
}

const AddressForm = ({
  title,
  functionName,
  placeholder,
  buttonText,
  onSubmit,
  prefill,
}: AddressFormProps) => {
  const [address, setAddress] = useState<string>(prefill || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(address as `0x${string}`)
    } catch (error) {
      console.error(error)
    }
    setIsSubmitting(false)
  }

  return (
    <FormField
      title={title}
      functionName={functionName}
      buttonText={buttonText}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <Input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder={placeholder}
        className="text-sm"
        disabled={isSubmitting}
      />
    </FormField>
  )
}
