"use server"

import { Badge } from "@/components/ui/badge"
import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import type { FlowWithGrants } from "@/lib/database/queries/flow"
import { Status } from "@/lib/enums"
import { cn, getEthAddress, getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { BudgetDialog } from "./budget-dialog"
import { FlowHeaderUserVotes } from "./flow-header-user-votes"
import { erc20Abi } from "viem"
import { nounsTokenAddress } from "@/lib/abis"
import { l1Client } from "@/lib/viem/client"

interface Props {
  flow: FlowWithGrants
  votingPower: number
}

export const FlowHeader = async (props: Props) => {
  const { flow, votingPower } = props
  const { isTopLevel } = flow

  const nounsTokenSupply = await l1Client.readContract({
    abi: erc20Abi,
    address: nounsTokenAddress[1],
    functionName: "totalSupply",
  })

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
                <BudgetDialog nounsTokenSupply={Number(nounsTokenSupply)} flow={flow} />
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
