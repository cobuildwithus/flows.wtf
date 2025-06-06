import "server-only"

import { getFlow } from "@/lib/database/queries/flow"
import { Metadata } from "next"
import { CustomFlowPage } from "../custom-flow-page"
import { getCustomFlow } from "../custom-flows"

const customFlow = getCustomFlow("gnars")

export async function generateMetadata(): Promise<Metadata> {
  const flow = await getFlow(customFlow.flowId)
  return { title: flow.title, description: flow.description }
}

export default async function GnarsPage() {
  return <CustomFlowPage customFlow={customFlow} />
}
