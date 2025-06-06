import "server-only"

import { getFlow } from "@/lib/database/queries/flow"
import { getAccelerator } from "@/lib/onchain-startup/data/accelerators"
import { Metadata } from "next"
import { AcceleratorPage } from "../page"

const accelerator = getAccelerator("gnars")

export async function generateMetadata(): Promise<Metadata> {
  const flow = await getFlow(accelerator.flowId)
  return { title: flow.title, description: flow.description }
}

export default async function GroundsPage() {
  return <AcceleratorPage accelerator={accelerator} />
}
