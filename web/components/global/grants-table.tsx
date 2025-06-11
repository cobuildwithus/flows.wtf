import { MonthlyBudget } from "@/app/components/monthly-budget"
import { AnimatedSalary } from "@/components/global/animated-salary"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DateTime } from "@/components/ui/date-time"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Status } from "@/lib/enums"
import { cn, getIpfsUrl } from "@/lib/utils"
import type { DerivedData } from "@prisma/flows"
import type { Profile } from "@/components/user-profile/get-user-profile"
import Link from "next/link"
import { GrantLogoCell } from "@/components/global/grant-logo-cell"
import { AllocationInput } from "@/components/global/allocation-input"
import { LimitedGrant } from "@/lib/database/types"
import { RemoveRecipientButton } from "./remove-recipient-button"

interface Props {
  flow: LimitedGrant
  grants: Array<
    LimitedGrant & { derivedData: Pick<DerivedData, "lastBuilderUpdate"> | null; profile: Profile }
  >
  canManage?: boolean
}

export function GrantsTable(props: Props) {
  const { flow, grants, canManage = false } = props

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={2}>Name</TableHead>
          {!flow.isTopLevel && <TableHead>Builder</TableHead>}
          <TableHead className="text-center">Total earned</TableHead>
          <TableHead className="text-center">Monthly support</TableHead>
          {!flow.allocator && <TableHead className="text-center">Votes</TableHead>}
          <TableHead className="text-right">{canManage ? "Manage payout" : "Your Vote"}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {grants.map((grant) => {
          const isRemovalRequested = grant.status === Status.ClearingRequested
          const lastUpdate = grant.derivedData?.lastBuilderUpdate || new Date(0)

          const hasUpdate = lastUpdate.getTime() > 0
          const lastUpdateTime = hasUpdate ? lastUpdate.getTime() / 1000 : 0
          const hasRecentUpdate =
            hasUpdate && new Date().getTime() / 1000 - lastUpdateTime < 10 * 24 * 60 * 60

          return (
            <TableRow key={grant.id}>
              <GrantLogoCell image={getIpfsUrl(grant.image, "pinata")} title={grant.title} />

              <TableCell className="space-y-1">
                <div className="max-w-64 overflow-hidden text-ellipsis max-sm:truncate">
                  <Link
                    href={
                      flow.isTopLevel && grant.isFlow && !isRemovalRequested
                        ? `/flow/${grant.id}`
                        : `/item/${grant.id}`
                    }
                    className="text-sm font-medium duration-100 ease-out hover:text-primary md:whitespace-normal"
                    tabIndex={-1}
                  >
                    {grant.title}
                  </Link>
                </div>

                {isRemovalRequested && <Badge variant="warning">Challenged</Badge>}
              </TableCell>
              {!flow.isTopLevel && (
                <TableCell>
                  <div className="relative inline-flex">
                    <div className="flex items-center space-x-1.5">
                      <Avatar className="size-7 bg-accent text-xs">
                        <AvatarImage src={grant.profile.pfp_url} alt={grant.profile.display_name} />
                        <AvatarFallback>
                          {grant.profile.display_name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="tracking-tight max-sm:hidden">
                        {grant.profile.display_name}
                      </span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            "absolute left-5 top-0 inline-block size-2.5 cursor-help rounded-full",
                            {
                              "bg-red-500": !hasRecentUpdate,
                              "bg-green-500": hasRecentUpdate,
                            },
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {hasUpdate && (
                          <p>
                            Posted update <DateTime date={lastUpdate} relative />
                          </p>
                        )}
                        {!hasUpdate && <p>Builder hasn&apos;t posted any updates yet</p>}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              )}

              <TableCell className="text-center">
                <AnimatedSalary
                  value={grant.totalEarned}
                  monthlyRate={grant.monthlyIncomingFlowRate}
                />
              </TableCell>

              <TableCell className="text-center">
                <MonthlyBudget display={grant.monthlyIncomingFlowRate} flow={grant} />
              </TableCell>

              {!flow.allocator && (
                <TableCell className="text-center">{grant.allocationsCount}</TableCell>
              )}

              <TableCell className="w-[120px] max-w-[120px] text-center">
                <div className="flex items-center gap-1 px-0.5">
                  <div className="w-[100px]">
                    <AllocationInput recipientId={grant.recipientId} />
                  </div>
                  {canManage && (
                    <RemoveRecipientButton
                      contract={flow.recipient}
                      recipientId={grant.recipientId}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
