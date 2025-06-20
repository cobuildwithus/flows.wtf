import { getCustomFlowById } from "@/app/(custom-flow)/custom-flows"
import { SwapTokenButton } from "@/app/token/swap-token-button"
import { DonationModal } from "@/components/donation-modal"
import { Submenu } from "@/components/global/submenu"
import { Button } from "@/components/ui/button"
import { DRAFT_CUTOFF_DATE } from "@/lib/config"
import database from "@/lib/database/flows-db"
import { isGrantApproved, isGrantAwaiting } from "@/lib/database/helpers"
import { getFlowWithGrants } from "@/lib/database/queries/flow"
import { getEthAddress } from "@/lib/utils"
import Link from "next/link"
import { AllocationToggle } from "./allocation-toggle"

interface Props {
  flowId: string
  segment: "approved" | "curate" | "drafts"
}

export const FlowSubmenu = async (props: Props) => {
  const { flowId, segment } = props

  const [flow, draftsCount] = await Promise.all([
    getFlowWithGrants(flowId),
    database.draft.count({
      where: { flowId, isPrivate: false, isOnchain: false, createdAt: { gt: DRAFT_CUTOFF_DATE } },
    }),
  ])

  const customFlow = getCustomFlowById(flowId)
  const flowUrl = customFlow ? `/${customFlow.id}` : `/flow/${flowId}`

  const isApproved = segment === "approved"
  const isCurate = segment === "curate"
  const isDrafts = segment === "drafts"

  const approvedCount = flow.subgrants.filter(isGrantApproved).length
  const awaitingCount = flow.subgrants.filter(isGrantAwaiting).length
  const isFlowRemoved = flow.isRemoved

  const links: { label: string; href: string; isActive: boolean; badge?: number }[] = [
    {
      label: flow.isTopLevel ? "Flows" : "Projects",
      href: flowUrl,
      isActive: isApproved,
    },
  ]

  if (!flow.isTopLevel && !!flow.tcr) {
    links.push({
      label: "Curate",
      href: `/flow/${flowId}/curate`,
      isActive: isCurate,
      badge: awaitingCount,
    })
  }

  links.push({
    label: "Drafts",
    href: `/flow/${flowId}/drafts`,
    isActive: isDrafts,
    badge: draftsCount,
  })

  return (
    <div className="mb-4 mt-14 flex items-center justify-between md:mb-8">
      <Submenu links={links} />

      <div className="max-sm:hidden">
        <div className="flex items-center space-x-2">
          {flow.tokenEmitter && flow.erc20 && (
            <SwapTokenButton
              flow={flow}
              extraInfo="curator"
              variant="secondary"
              defaultTokenAmount={BigInt(1e18)}
              erc20Address={getEthAddress(flow.erc20)}
            />
          )}
          {isApproved && approvedCount > 0 && <AllocationToggle />}
          {(isDrafts || isCurate || (isApproved && approvedCount === 0)) && !isFlowRemoved && (
            <Link href={`/apply/${flowId}`}>
              <Button>{flow.isTopLevel ? "Suggest flow" : "Apply for funding"}</Button>
            </Link>
          )}
          {/* <DonationModal id={flowId} name={flow.title} /> */}
        </div>
      </div>
    </div>
  )
}
