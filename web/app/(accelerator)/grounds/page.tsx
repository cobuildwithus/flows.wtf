import "server-only"

import { getFlow } from "@/lib/database/queries/flow"
import { getAccelerator } from "@/lib/onchain-startup/data/accelerators"
import { Metadata } from "next"
import { AcceleratorPage } from "../page"

const accelerator = getAccelerator("grounds")

export async function generateMetadata(): Promise<Metadata> {
  const flow = await getFlow(accelerator.flowId)
  return {
    title: flow.title,
    description:
      "Wake up! Be bold and fund good people. We fund innovative coffee projects, with a rich blend of builders and communities.",
  }
}

export default async function GroundsPage() {
  return <AcceleratorPage accelerator={accelerator} />
}
