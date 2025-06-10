import "server-only"

import { getFlow } from "@/lib/database/queries/flow"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { CustomFlowPage } from "../custom-flow-page"
import { getCustomFlow } from "../custom-flows"

const customFlow = getCustomFlow("grounds")

export async function generateMetadata(): Promise<Metadata> {
  if (!customFlow) notFound()
  const flow = await getFlow(customFlow.flowId)
  return {
    title: flow.title,
    description:
      "Wake up! Be bold and fund good people. We fund innovative coffee projects, with a rich blend of builders and communities.",
  }
}

export default async function GroundsPage() {
  if (!customFlow) notFound()
  return <CustomFlowPage customFlow={customFlow} />
}
