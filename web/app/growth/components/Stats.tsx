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
import { Currency } from "@/components/ui/currency"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Grant } from "@prisma/flows"
import { Stat } from "@/app/item/[grantId]/cards/stats"
import { getRemovedGrants } from "@/app/flow/[flowId]/curate/components/get-removed-grants"
import { GrantCell } from "@/app/flow/[flowId]/curate/components/grant-cell"
import RemovalReasonDialog from "@/app/flow/[flowId]/curate/components/removal-reason-dialog"
import { Suspense } from "react"

interface Props {
  flow: Pick<Grant, "id" | "totalEarned" | "activeRecipientCount">
  defaultOpen?: boolean
  className?: string
}

export default async function PerformanceStats(props: Props) {
  const { flow, defaultOpen = false, className } = props

  const totalGrantsAccepted = flow.activeRecipientCount

  return (
    <div className={cn(className)}>
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger className="mb-4 flex w-full items-center justify-between hover:opacity-70">
          <span className="font-semibold text-muted-foreground md:text-xl">Performance</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-12 gap-x-2 gap-y-4 py-1 lg:gap-x-4">
              <div className="col-span-full xl:col-span-3">
                <Stat label="Total paid out">
                  <Currency>{flow.totalEarned}</Currency>
                </Stat>
              </div>
              <div className="col-span-full xl:col-span-3">
                <Stat label="Active projects">{totalGrantsAccepted}</Stat>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Suspense>
        <ApprovalRateSection flow={flow} className="mt-8" defaultOpen={defaultOpen} />
      </Suspense>
    </div>
  )
}

async function ApprovalRateSection(props: Props) {
  const { flow, defaultOpen = false, className } = props

  const grants = await getRemovedGrants(flow.id, "rejected")
  const hasGrants = grants.length > 0

  const totalGrantsAccepted = flow.activeRecipientCount + grants.length

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
            </div>
            {hasGrants && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead colSpan={4}>Project</TableHead>
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
