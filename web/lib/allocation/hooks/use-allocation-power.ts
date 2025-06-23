"use client"

import useSWR from "swr"
import { useAccount } from "wagmi"

import { useFlow } from "./use-flow"
import { getAllocationPower } from "../allocation-power/get-allocation-power"

export function useAllocationPower() {
  const { flowId } = useFlow()

  const { address } = useAccount()

  const { data: allocationPower, isLoading } = useSWR<bigint>(
    address ? ["allocation-power", address] : null,
    () => getAllocationPower(address, flowId),
  )

  return {
    allocationPower,
    isLoading,
  }
}
