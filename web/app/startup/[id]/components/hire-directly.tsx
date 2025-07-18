"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddRecipientModal } from "@/app/flow/[flowId]/components/add-recipient-modal"
import { Grant } from "@/lib/database/types"
import { BudgetWithGrants } from "@/lib/onchain-startup/budgets-with-grants"

interface Props {
  budgets: BudgetWithGrants[]
}

export function HireDirectly(props: Props) {
  const { budgets } = props

  if (budgets.length === 0) {
    return null
  }

  const firstBudget = budgets[0]

  const flow: Pick<Grant, "id" | "chainId" | "recipient" | "superToken"> = {
    id: firstBudget.id,
    chainId: firstBudget.chainId,
    recipient: firstBudget.recipient,
    superToken: firstBudget.superToken,
  }

  return (
    <AddRecipientModal flow={flow}>
      <div className="flex flex-col items-center">
        <div className="flex min-w-64 shrink-0 cursor-pointer flex-col justify-between rounded-lg border border-dashed border-muted-foreground/50 p-4 transition-colors hover:border-primary">
          <div>
            <div className="mt-2 flex flex-row justify-start gap-x-1.5">
              <Badge variant="outline" className="py-0 text-[11px]">
                Manage
              </Badge>
            </div>

            <h3 className="mt-3 text-sm font-medium">Add teammate</h3>

            <div className="text-xs text-muted-foreground">Add a new team member</div>

            <div className="mt-3">
              <Button size="sm" className="py-0.5" variant="secondary">
                + Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AddRecipientModal>
  )
}
