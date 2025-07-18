"use server"

import { Badge } from "@/components/ui/badge"
import { Status } from "@/lib/enums"
import { getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { BudgetDialog } from "./budget-dialog"
import { getTotalAllocationWeight } from "@/lib/allocation/get-total-allocation-weight"
import { Currency } from "@/components/ui/currency"
import type { DerivedData, Grant } from "@prisma/flows"

interface Props {
  flow: Grant & { derivedData: Pick<DerivedData, "minimumSalary"> | null }
}

export const FlowHeader = async (props: Props) => {
  const { flow } = props

  const totalAllocationWeight = await getTotalAllocationWeight(
    flow.allocationStrategies,
    flow.chainId,
  )

  return (
    <div className="flex flex-col items-start justify-between space-y-6 md:flex-row md:items-center md:space-x-4 md:space-y-0">
      <div className="flex items-center space-x-5">
        <Image
          src={getIpfsUrl(flow.image)}
          alt={flow.title}
          className="size-14 rounded-full object-cover md:size-20"
          height="80"
          width="80"
        />
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-start space-y-2">
              <Link
                href={`/flow/${flow.id}/about`}
                className="text-2xl font-semibold hover:text-primary md:text-3xl"
              >
                {flow.title}
              </Link>
              <div className="text-sm max-sm:text-xs md:text-center">
                <BudgetDialog totalAllocationWeight={Number(totalAllocationWeight)} flow={flow}>
                  <Badge className="cursor-help">
                    <Currency display={flow}>
                      {(flow.activeRecipientCount > 0
                        ? flow.monthlyOutgoingFlowRate
                        : flow.monthlyIncomingFlowRate
                      ).toString()}
                    </Currency>{" "}
                    /mo
                  </Badge>
                </BudgetDialog>
              </div>
            </div>
            {flow.status === Status.ClearingRequested && (
              <Link href={`/flow/${flow.id}/about`}>
                <Badge variant="warning">Challenged</Badge>
              </Link>
            )}
            {flow.status === Status.Absent && (
              <Link href={`/flow/${flow.id}/about`}>
                <Badge variant="warning">Removed</Badge>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
