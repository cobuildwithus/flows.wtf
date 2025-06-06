import "server-only"

import { getFlow } from "@/lib/database/queries/flow"
import { getAccelerator } from "@/lib/onchain-startup/data/accelerators"
import { Metadata } from "next"
import { AcceleratorPage } from "../accelerator-page"

const accelerator = getAccelerator("vrbs")

export async function generateMetadata(): Promise<Metadata> {
  const flow = await getFlow(accelerator.flowId)
  return { title: flow.title, description: flow.tagline }
}

export default async function VrbsPage() {
  return <AcceleratorPage accelerator={accelerator} />
}
