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
import { getEthAddress } from "@/lib/utils"
import { AllocationProvider } from "@/lib/allocation/allocation-context"
import { GrantsTable } from "@/components/global/grants-table"
import { AllocationBar } from "@/components/global/allocation-bar"
import { Currency } from "@/components/ui/currency"
import { LimitedGrant } from "@/lib/database/types"
import { FundFlow } from "@/components/fund-flow/fund-flow"

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
  isManager: boolean
  user: string | null
  children?: React.ReactNode
}

export function AllocateBudgets(props: Props) {
  const { flows, grants, children, isAllocator, isManager, user } = props
  const [open, setOpen] = useState(false)
  const [selectedFlowIndex, setSelectedFlowIndex] = useState(0)

  const selectedFlow = flows[selectedFlowIndex]
  const selectedGrants = grants[selectedFlowIndex] || []

  // Calculate total budget across all flows
  const totalBudget = flows.reduce((sum, flow) => {
    return sum + Number(flow.monthlyIncomingFlowRate)
  }, 0)

  if (!isAllocator && !isManager) {
    return <div className="flex shrink-0 space-x-4">{children}</div>
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex shrink-0 cursor-pointer space-x-4">{children}</div>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] w-[95vw] max-w-[95vw] overflow-y-auto px-8 md:max-w-6xl">
        <DialogHeader className="hidden">
          <DialogTitle>Manage flows</DialogTitle>
        </DialogHeader>
        <div className="mb-20 mt-3 overflow-hidden">
          <div className="flex items-center justify-between space-x-2 pb-4">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {flows.map((flow, index) => (
                <div
                  key={flow.id}
                  className={`h-10 shrink-0 cursor-pointer px-3 py-2 text-base font-medium transition-colors ${
                    selectedFlowIndex === index
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setSelectedFlowIndex(index)}
                >
                  {flow.title}
                </div>
              ))}
            </div>
            <div className="shrink-0">
              <FundFlow size="sm" flow={selectedFlow} variant="outline" />
            </div>
          </div>

          <div className="overflow-x-auto">
            {selectedGrants.length > 0 ? (
              <AllocationProvider
                chainId={selectedFlow.chainId}
                contract={getEthAddress(selectedFlow.recipient)}
                strategies={selectedFlow.allocationStrategies}
                user={user}
                defaultActive
              >
                <GrantsTable
                  canManage={isManager}
                  flow={selectedFlow}
                  grants={selectedGrants}
                  hideBuilder
                />
                <AllocationBar />
              </AllocationProvider>
            ) : (
              <EmptyBudgetState />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const EmptyBudgetState = () => {
  return (
    <div className="flex h-[340px] flex-col items-center justify-center space-y-4 py-20 text-center">
      <div className="text-lg font-medium text-muted-foreground">No contributors to pay yet</div>
      <div className="text-sm text-muted-foreground">
        Create an opportunity or review applications to start allocating your budget
      </div>
    </div>
  )
}
