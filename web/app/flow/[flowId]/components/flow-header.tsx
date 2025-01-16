import { Badge } from "@/components/ui/badge"
import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import { FlowWithGrants } from "@/lib/database/queries/flow"
import { Status } from "@/lib/enums"
import { cn, getEthAddress, getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { BudgetDialog } from "./budget-dialog"
import { FlowHeaderUserVotes } from "./flow-header-user-votes"

interface Props {
  flow: FlowWithGrants
  votingPower: number
}

export const FlowHeader = (props: Props) => {
  const { flow, votingPower } = props
  const { isTopLevel } = flow

  return (
    <div className="flex flex-col items-start justify-between space-y-6 md:flex-row md:items-center md:space-x-4 md:space-y-0">
      <div className="flex items-center space-x-4">
        <Image
          src={getIpfsUrl(flow.image)}
          alt={flow.title}
          className="size-14 rounded-full object-cover md:size-20"
          height="80"
          width="80"
        />
        <div>
          <div className="flex items-center space-x-2">
            <Link
              href={`/flow/${flow.id}/about`}
              className="text-lg font-semibold hover:text-primary md:text-xl"
            >
              {flow.title}
            </Link>
            {flow.status === Status.ClearingRequested && (
              <Link href={`/flow/${flow.id}/about`}>
                <Badge variant="destructive">Removal Requested</Badge>
              </Link>
            )}
          </div>
          <div className="text-balance text-xs text-muted-foreground md:mt-1 md:text-sm">
            {flow.tagline}
          </div>
        </div>
      </div>
      <div
        className={cn("grid w-full gap-x-4 gap-y-8 text-sm max-sm:text-xs md:w-auto md:shrink-0", {
          "grid-cols-2 md:grid-cols-2": isTopLevel,
          "grid-cols-2 md:grid-cols-4": !isTopLevel && votingPower > 0,
          "grid-cols-2 md:grid-cols-3": !isTopLevel && votingPower === 0,
        })}
      >
        <div className="max-sm:flex max-sm:flex-col max-sm:items-start md:text-center">
          <p className="mb-1.5 text-muted-foreground">{isTopLevel ? "Flows" : "Grants"}</p>
          <GrantStatusCountBadges id={flow.id} flow={flow} alwaysShowAll />
        </div>
        <div className="md:text-center">
          <p className="mb-1.5 text-muted-foreground">Budget</p>
          <BudgetDialog flow={flow} />
        </div>
        {!flow.isTopLevel && (
          <>
            <div className="md:text-center">
              <p className="mb-1.5 text-muted-foreground">Community Votes</p>
              <p className="text-sm font-medium">{flow.votesCount} </p>
            </div>

            {votingPower > 0 && (
              <FlowHeaderUserVotes
                parent={getEthAddress(flow.parentContract)}
                recipientId={flow.id}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
