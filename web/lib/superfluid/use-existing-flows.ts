"use client"

import { useServerFunction } from "@/lib/hooks/use-server-function"
import { getExistingFlows } from "./get-users-existing-flows"

export function useExistingFlows(address: string | undefined, chainId?: number, receiver?: string) {
  const { data, ...rest } = useServerFunction(
    getExistingFlows,
    address || receiver
      ? `existing-flows-${address?.toLowerCase() || receiver?.toLowerCase()}`
      : undefined,
    [address, chainId] as [string | undefined, number | undefined],
  )

  return {
    data: receiver
      ? data?.filter((flow) => flow.receiver.toLowerCase() === receiver.toLowerCase())
      : data,
    ...rest,
  }
}
