"use client"

import { useServerFunction } from "@/lib/hooks/use-server-function"
import { getExistingFlows } from "./get-existing-flows"

export function useExistingFlows(address: string | undefined, chainId?: number, receiver?: string) {
  const { data, ...rest } = useServerFunction(
    getExistingFlows,
    address ? `existing-flows-${address.toLowerCase()}` : undefined,
    [address, chainId] as [string | undefined, number | undefined],
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    },
  )

  return {
    data: receiver
      ? data?.filter((flow) => flow.receiver.toLowerCase() === receiver.toLowerCase())
      : data,
    ...rest,
  }
}
