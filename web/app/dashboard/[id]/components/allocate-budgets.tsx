"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Profile } from "@/components/user-profile/get-user-profile"
import type { DerivedData } from "@prisma/flows"
import { useState } from "react"
import { type LimitedGrant } from "@/app/flow/[flowId]/components/grants-list"
import { getEthAddress } from "@/lib/utils"
import { AllocationProvider } from "@/lib/voting/allocation-context"
import { base } from "viem/chains"
import { GrantsTable } from "@/app/flow/[flowId]/components/grants-table"
import { AllocationBar } from "@/components/global/allocation-bar"
import { Currency } from "@/components/ui/currency"

interface Props {
  flows: LimitedGrant[]
  grants: Array<
    LimitedGrant & {
      derivedData: Pick<
        DerivedData,
        "lastBuilderUpdate" | "overallGrade" | "title" | "coverImage"
      > | null
      profile: Profile
    }
  >[]
  isAllocator: boolean
  children?: React.ReactNode
}

export function AllocateBudgets(props: Props) {
  const { flows, grants, children, isAllocator } = props
  const [open, setOpen] = useState(false)
  const [selectedFlowIndex, setSelectedFlowIndex] = useState(0)

  const selectedFlow = flows[selectedFlowIndex]
  const selectedGrants = grants[selectedFlowIndex] || []

  // Calculate total budget across all flows
  const totalBudget = flows.reduce((sum, flow) => {
    return sum + BigInt(flow.monthlyIncomingFlowRate || "0")
  }, BigInt(0))

  if (!isAllocator) {
    return <div className="contents">{children}</div>
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="contents cursor-pointer">{children}</div>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] w-full max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage your budgets</DialogTitle>
        </DialogHeader>
        <div className="mb-20">
          <div className="mb-8 text-xs text-muted-foreground">
            <Currency>{totalBudget}</Currency>
            /mo total
          </div>

          {flows.length > 1 && (
            <div className="mb-6 flex items-center justify-start space-x-2">
              {flows.map((flow, index) => (
                <Button
                  key={flow.id}
                  className="h-7 rounded-full px-5"
                  onClick={() => setSelectedFlowIndex(index)}
                  variant={selectedFlowIndex === index ? "default" : "outline"}
                >
                  {flow.title}
                  {selectedFlowIndex === index && (
                    <span className="ml-2 text-xs">
                      - <Currency>{BigInt(flow.monthlyIncomingFlowRate || "0")}</Currency>/mo
                    </span>
                  )}
                </Button>
              ))}
            </div>
          )}

          <div className="min-h-[340px]">
            <AllocationProvider
              chainId={base.id}
              contract={getEthAddress(selectedFlow.recipient)}
              votingToken={selectedFlow.erc721VotingToken}
              allocator={selectedFlow.allocator}
              defaultActive
            >
              <GrantsTable flow={selectedFlow} grants={selectedGrants} />
              <AllocationBar />
            </AllocationProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
