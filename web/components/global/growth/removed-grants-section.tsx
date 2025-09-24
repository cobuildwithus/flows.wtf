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
import { getRemovedGrants } from "@/lib/database/queries/get-removed-grants"
import { GrantCell } from "./grant-cell"
import RemovalReasonDialog from "./removal-reason-dialog"
import { Stat } from "@/app/item/[grantId]/cards/stats"
import { RugRateExplainerDialog } from "./rug-rate-explainer"

interface Props {
  flow: Pick<Grant, "id" | "totalEarned" | "isTopLevel">
  defaultOpen?: boolean
  className?: string
}

export default async function RemovedGrantsSection(props: Props) {
  const { flow, defaultOpen = false, className } = props

  const removedGrants = await getRemovedGrants(flow.id, flow.isTopLevel, "removed")

  const hasRemovedGrants = removedGrants.length > 0

  if (!hasRemovedGrants) return null

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
                  <Currency>{String(flow.totalEarned)}</Currency>
                </Stat>
              </div>
              <RugRateExplainerDialog
                removedGrants={removedGrants}
                totalPaidOut={Number(flow.totalEarned)}
              />
            </div>
            {hasRemovedGrants && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead colSpan={4}>Removed project</TableHead>
                    <TableHead className="text-right">Earned</TableHead>
                    <TableHead className="text-right">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {removedGrants.map((grant) => (
                    <TableRow key={grant.id}>
                      <TableCell colSpan={4}>
                        <GrantCell grant={grant} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col justify-end space-y-1">
                          <Currency className="text-right text-xl font-medium">
                            {String(grant.totalEarned)}
                          </Currency>
                        </div>
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
