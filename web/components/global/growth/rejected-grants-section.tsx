"use server"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Stat } from "@/app/item/[grantId]/cards/stats"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Grant } from "@prisma/flows"
import { getRemovedGrants } from "@/lib/database/queries/get-removed-grants"
import { GrantCell } from "./grant-cell"
import RemovalReasonDialog from "./removal-reason-dialog"

interface Props {
  flow: Pick<Grant, "id" | "totalEarned" | "activeRecipientCount" | "isTopLevel">
  defaultOpen?: boolean
  topLevelRecipientCount?: number
  className?: string
}

export default async function RejectedGrantsSection(props: Props) {
  const { flow, defaultOpen = false, className, topLevelRecipientCount = 0 } = props

  const grants = await getRemovedGrants(flow.id, flow.isTopLevel, "rejected")
  const hasGrants = grants.length > 0

  const totalGrantsAccepted = flow.isTopLevel
    ? topLevelRecipientCount
    : flow.activeRecipientCount + grants.length

  const acceptanceRate = ((totalGrantsAccepted - grants.length) / totalGrantsAccepted) * 100

  return (
    <div className={cn(className)}>
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger className="mb-4 flex w-full items-center justify-between hover:opacity-70">
          <span className="font-semibold text-muted-foreground md:text-xl">Approval rate</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>

        <CollapsibleContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-12 gap-x-2 gap-y-4 py-1 lg:gap-x-4">
              <div className="col-span-full xl:col-span-3">
                <Stat label="Acceptance rate">{acceptanceRate.toFixed(0)}%</Stat>
              </div>
              <div className="col-span-full xl:col-span-3">
                <Stat label="Declined projects">{grants.length}</Stat>
              </div>
              <div className="col-span-full xl:col-span-3">
                <Stat label="Accepted projects">{totalGrantsAccepted}</Stat>
              </div>
            </div>
            {hasGrants && !flow.isTopLevel && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead colSpan={4}>Denied project</TableHead>
                    <TableHead className="text-right">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grants.map((grant) => (
                    <TableRow key={grant.id}>
                      <TableCell colSpan={4}>
                        <GrantCell grant={grant} />
                      </TableCell>
                      <TableCell className="text-right">
                        <RemovalReasonDialog grant={grant} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
