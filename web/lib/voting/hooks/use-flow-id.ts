"use client"

import { customFlows } from "@/addresses"
import { NOUNS_FLOW } from "@/lib/config"
import { AcceleratorId, getAccelerator } from "@/lib/onchain-startup/data/accelerators"
import { useParams, usePathname } from "next/navigation"

export function useFlowId() {
  const { flowId: paramsFlowId } = useParams<{ flowId: string }>()
  const pathname = usePathname()

  return getFlowIdFromPath(pathname, paramsFlowId)
}

function getFlowIdFromPath(pathname: string, paramsFlowId?: string): string {
  const name = pathname.substring(1) as string
  try {
    return getAccelerator(name as AcceleratorId).flowId
  } catch (error) {
    if (name in customFlows) {
      return customFlows[name as keyof typeof customFlows]
    }

    return paramsFlowId || NOUNS_FLOW
  }
}
