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
import { isGrantApproved } from "@/lib/database/helpers"
import { Status } from "@/lib/enums"
import { getIpfsUrl } from "@/lib/utils"
import { Grant } from "@prisma/flows"
import Image from "next/image"
import Link from "next/link"
import { VotingInput } from "../flow/[flowId]/components/voting-input"
import { MonthlyBudget } from "./monthly-budget"

interface Props {
  flows: Array<Grant>
}

export const FlowsTable = (props: Props) => {
  const { flows } = props

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={2}>Name</TableHead>
          <TableHead className="text-center">Grants</TableHead>
          <TableHead className="text-center">Paid out</TableHead>
          <TableHead className="text-center">Monthly support</TableHead>
          <TableHead className="text-center">Community Votes</TableHead>
          <TableHead className="text-center">Your Vote</TableHead>
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
                    <Badge variant="destructive">Removal Requested</Badge>
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
              <TableCell className="text-center">{flow.votesCount}</TableCell>
              <TableCell className="w-[100px] max-w-[100px] text-center">
                <div className="px-0.5">
                  <VotingInput recipientId={flow.id} />
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
