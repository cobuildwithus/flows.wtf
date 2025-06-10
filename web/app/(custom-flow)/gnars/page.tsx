import "server-only"

import { getFlow } from "@/lib/database/queries/flow"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { CustomFlowPage } from "../custom-flow-page"
import { getCustomFlow } from "../custom-flows"

const customFlow = getCustomFlow("gnars")

export async function generateMetadata(): Promise<Metadata> {
  if (!customFlow) notFound()
  const flow = await getFlow(customFlow.flowId)
  return { title: flow.title, description: flow.description }
}

export default async function GnarsPage() {
  if (!customFlow) notFound()
  return <CustomFlowPage customFlow={customFlow} />
}
