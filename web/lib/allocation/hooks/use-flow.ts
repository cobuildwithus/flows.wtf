"use client"

import { accelerators, customFlows } from "@/addresses"
import { NOUNS_FLOW } from "@/lib/config"
import { useParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function useFlow() {
  const { flowId: paramsFlowId } = useParams<{ flowId: string }>()
  const pathname = usePathname()
  const [flowId, setFlowId] = useState<string | null>(paramsFlowId)
  const [url, setUrl] = useState<string | null>(`/flow/${paramsFlowId}`)

  useEffect(() => {
    const name = pathname.substring(1) as any

    if (name in accelerators) {
      setFlowId(accelerators[name as keyof typeof accelerators])
      setUrl(`/${name}`)
      return
    }

    if (name in customFlows) {
      setFlowId(customFlows[name as keyof typeof customFlows])
      setUrl(`/${name}`)
      return
    }

    setFlowId(paramsFlowId || NOUNS_FLOW)
    setUrl(`/flow/${paramsFlowId}`)
  }, [pathname])

  return { flowId, url }
}
