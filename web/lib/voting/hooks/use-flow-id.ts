"use client"

import { NOUNS_FLOW } from "@/lib/config"
import { AcceleratorId, getAccelerator } from "@/lib/onchain-startup/data/accelerators"
import { useParams, usePathname } from "next/navigation"

export function useFlowId() {
  const { flowId: paramsFlowId } = useParams<{ flowId: string }>()
  const pathname = usePathname()

  return getFlowIdFromPath(pathname, paramsFlowId)
}

function getFlowIdFromPath(pathname: string, paramsFlowId?: string): string {
  try {
    const acceleratorId = pathname.substring(1) as AcceleratorId
    return getAccelerator(acceleratorId).flowId
  } catch (error) {
    return paramsFlowId || NOUNS_FLOW
  }
}
