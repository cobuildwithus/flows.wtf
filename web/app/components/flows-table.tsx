import { AnimatedSalary } from "@/components/global/animated-salary"
import { Badge } from "@/components/ui/badge"
import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Status } from "@/lib/enums"
import { getIpfsUrl } from "@/lib/utils"
import type { Grant } from "@prisma/flows"
import Image from "next/image"
import Link from "next/link"
import { AllocationInput } from "@/components/global/allocation-input"
import { RemoveRecipientButton } from "@/components/global/remove-recipient-button"
import { MonthlyBudget, type FlowWithBudget } from "./monthly-budget"

export type LimitedFlow = FlowWithBudget &
  Pick<
    Grant,
    | "id"
    | "title"
    | "image"
    | "tagline"
    | "status"
    | "activeRecipientCount"
    | "awaitingRecipientCount"
    | "challengedRecipientCount"
    | "totalEarned"
    | "isFlow"
    | "allocationsCount"
    | "recipientId"
    | "superTokenSymbol"
    | "superTokenPrefix"
  >

interface Props {
  flows: Array<LimitedFlow>
  canManage?: boolean
  contract: `0x${string}`
  chainId: number
}

export const FlowsTable = (props: Props) => {
  const { flows, canManage = false, contract, chainId } = props

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={2}>Name</TableHead>
          <TableHead className="text-center">Grants</TableHead>
          <TableHead className="text-center">Paid out</TableHead>
          <TableHead className="text-center">Monthly support</TableHead>
          <TableHead className="text-center">Votes</TableHead>
          <TableHead className="text-center">{canManage ? "Manage" : "Your Vote"}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flows.map((flow) => {
          const approvedGrants = flow.activeRecipientCount

          return (
            <TableRow key={flow.title}>
              <TableCell className="min-w-12 pr-0 md:w-[86px]">
                <Image
                  src={getIpfsUrl(flow.image)}
                  alt={flow.title}
                  width={72}
                  height={72}
                  className="aspect-square size-10 rounded-md object-cover md:size-[72px]"
                />
              </TableCell>
              <TableCell>
                <Link
                  href={`/flow/${flow.id}`}
                  className="font-medium duration-100 ease-out hover:text-primary md:text-lg lg:text-xl"
                  tabIndex={-1}
                >
                  {flow.title}
                </Link>

                <p className="mt-0.5 max-w-[300px] truncate text-xs tracking-tight text-muted-foreground max-sm:hidden md:text-sm">
                  {flow.tagline}
                </p>

                {flow.status === Status.ClearingRequested && (
                  <Link tabIndex={-1} href={`/item/${flow.id}`}>
                    <Badge variant="warning">Challenged</Badge>
                  </Link>
                )}
              </TableCell>
              <TableCell>
                <GrantStatusCountBadges id={flow.id} flow={flow} alwaysShowAll />
              </TableCell>
              <TableCell className="text-center">
                <AnimatedSalary
                  value={flow.totalEarned}
                  monthlyRate={
                    flow.isFlow ? flow.monthlyOutgoingFlowRate : flow.monthlyIncomingFlowRate
                  }
                />
              </TableCell>
              <TableCell className="text-center">
                <MonthlyBudget
                  display={
                    flow.isFlow ? flow.monthlyOutgoingFlowRate : flow.monthlyIncomingFlowRate
                  }
                  flow={flow}
                  approvedGrants={approvedGrants}
                />
              </TableCell>
              <TableCell className="text-center">{flow.allocationsCount}</TableCell>
              <TableCell className="w-[130px] max-w-[130px] text-center">
                <div className="flex items-center gap-1 px-0.5">
                  <div className="w-[130px]">
                    <AllocationInput recipientId={flow.recipientId} />
                  </div>
                  {canManage && (
                    <RemoveRecipientButton
                      contract={contract}
                      recipientId={flow.recipientId}
                      chainId={chainId}
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
