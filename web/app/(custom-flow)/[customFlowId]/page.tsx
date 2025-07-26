import "server-only"

import { getFlow } from "@/lib/database/queries/flow"
import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { CustomFlowPage as CustomFlowPageComponent } from "../custom-flow-page"
import { CustomFlowId, getCustomFlow } from "../custom-flows"
import { getStartup, getStartupIdFromSlug } from "@/lib/onchain-startup/startup"
import { getIpfsUrl } from "@/lib/utils"

interface Props {
  params: Promise<{ customFlowId: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { customFlowId } = await props.params

  const startupId = getStartupIdFromSlug(customFlowId)
  if (startupId) {
    const startup = await getStartup(startupId)

    return {
      title: startup.title,
      description: startup.tagline,
      openGraph: { images: [getIpfsUrl(startup.image, "pinata")] },
    }
  }

  const customFlow = getCustomFlow(customFlowId as CustomFlowId)

  if (!customFlow) notFound()
  const flow = await getFlow(customFlow.flowId)

  return {
    title: `${flow.title} | Flows`,
    description: flow.tagline,
    icons: [customFlow.logo],
  }
}

export default async function CustomFlowPage(props: Props) {
  const { customFlowId } = await props.params

  const startupId = getStartupIdFromSlug(customFlowId)
  if (startupId) return redirect(`/startup/${startupId}`)

  const customFlow = getCustomFlow(customFlowId as CustomFlowId)

  if (!customFlow) notFound()
  return <CustomFlowPageComponent customFlow={customFlow} />
}
