import "server-only"

import { getFlow } from "@/lib/database/queries/flow"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { CustomFlowPage as CustomFlowPageComponent } from "../custom-flow-page"
import { CustomFlowId, getCustomFlow } from "../custom-flows"

interface Props {
  params: Promise<{ customFlowId: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { customFlowId } = await props.params
  const customFlow = getCustomFlow(customFlowId as CustomFlowId)

  if (!customFlow) notFound()
  const flow = await getFlow(customFlow.flowId)
  return { title: flow.title, description: flow.tagline }
}

export default async function CustomFlowPage(props: Props) {
  const { customFlowId } = await props.params
  const customFlow = getCustomFlow(customFlowId as CustomFlowId)

  if (!customFlow) notFound()
  return <CustomFlowPageComponent customFlow={customFlow} />
}
