"use client"

import Image from "next/image"
import Flows from "@/public/logo.png"
import { useFlow } from "@/lib/allocation/hooks/use-flow"
import { getCustomFlowById } from "@/app/(custom-flow)/custom-flows"

export function Logo() {
  const { flowId } = useFlow()
  const customFlow = flowId ? getCustomFlowById(flowId) : undefined

  // If the customFlow exists, use its logo field (which is a path string)
  // Otherwise, use the default Flows logo
  const src = customFlow?.logo || Flows
  const alt = "Flows logo"

  // If src is a string (from customFlow.logo), pass it directly to Image
  // If src is an imported image (Flows), pass the import
  return <Image src={src} alt={alt} className="mr-2.5 h-5 w-auto md:h-10" width={40} height={40} />
}
