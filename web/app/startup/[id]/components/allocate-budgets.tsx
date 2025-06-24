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
    return <div className="contents">{children}</div>
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="contents cursor-pointer space-x-4">{children}</div>
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
                      - <Currency>{flow.monthlyIncomingFlowRate}</Currency>/mo
                    </span>
                  )}
                </Button>
              ))}
            </div>
          )}
          <div className="min-h-[340px]">
            {selectedGrants.length > 0 ? (
              <AllocationProvider
                chainId={selectedFlow.chainId}
                contract={getEthAddress(selectedFlow.recipient)}
                strategies={selectedFlow.allocationStrategies}
                user={user}
                defaultActive
              >
                <GrantsTable canManage={isManager} flow={selectedFlow} grants={selectedGrants} />
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
