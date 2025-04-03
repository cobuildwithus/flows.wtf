import { SwapTokenButton } from "@/app/token/swap-token-button"
import { Button } from "@/components/ui/button"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { isGrantApproved, isGrantAwaiting } from "@/lib/database/helpers"
import { getFlowWithGrants } from "@/lib/database/queries/flow"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { VotingToggle } from "./voting-toggle"
import { DRAFT_CUTOFF_DATE } from "@/lib/config"

interface Props {
  flowId: string
  segment: "approved" | "applications" | "drafts"
}

export const FlowSubmenu = async (props: Props) => {
  const { flowId, segment } = props

  const [flow, draftsCount] = await Promise.all([
    getFlowWithGrants(flowId),
    database.draft.count({
      where: { flowId, isPrivate: false, isOnchain: false, createdAt: { gt: DRAFT_CUTOFF_DATE } },
      ...getCacheStrategy(120),
    }),
  ])

  const isApproved = segment === "approved"
  const isApplications = segment === "applications"
  const isDrafts = segment === "drafts"

  const approvedCount = flow.subgrants.filter(isGrantApproved).length
  const awaitingCount = flow.subgrants.filter(isGrantAwaiting).length
  const isFlowRemoved = flow.isRemoved

  return (
    <div className="mb-4 mt-14 flex items-center justify-between md:mb-8">
      <div className="flex min-h-9 items-center space-x-5 md:space-x-7">
        <Link
          href={`/flow/${flowId}`}
          className="group flex items-center space-x-2 text-base font-medium md:text-xl"
        >
          <span
            className={cn({
              "opacity-50 duration-100 ease-in-out group-hover:opacity-100": !isApproved,
            })}
          >
            Projects
          </span>
        </Link>
        <Link
          className="group flex items-start space-x-1 text-base font-medium md:text-xl"
          href={`/flow/${flowId}/curate`}
        >
          <span
            className={cn("flex items-start", {
              "opacity-50 duration-100 ease-in-out group-hover:opacity-100": !isApplications,
            })}
          >
            Curate
          </span>
          {awaitingCount > 0 && (
            <span className="ml-1 inline-flex size-[18px] items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
              {awaitingCount}
            </span>
          )}
        </Link>
        <Link
          className="group flex items-start space-x-1 text-base font-medium md:text-xl"
          href={`/flow/${flowId}/drafts`}
        >
          <span
            className={cn({
              "opacity-50 duration-100 ease-in-out group-hover:opacity-100": !isDrafts,
            })}
          >
            Drafts
          </span>
          {draftsCount > 0 && (
            <span className="ml-1 inline-flex size-[18px] items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
              {draftsCount}
            </span>
          )}
        </Link>
      </div>

      <div className="max-sm:hidden">
        <div className="flex items-center space-x-2">
          <SwapTokenButton
            flow={flow}
            extraInfo="curator"
            variant="secondary"
            defaultTokenAmount={BigInt(1e18)}
          />
          {isApproved && approvedCount > 0 && <VotingToggle />}
          {(isDrafts || isApplications || (isApproved && approvedCount === 0)) &&
            !isFlowRemoved && (
              <Link href={`/apply/${flowId}`}>
                <Button>{flow.isTopLevel ? "Suggest flow" : "Apply for a grant"}</Button>
              </Link>
            )}
        </div>
      </div>
    </div>
  )
}
