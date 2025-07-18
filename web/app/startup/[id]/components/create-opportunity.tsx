"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Currency } from "@/components/ui/currency"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { createOpportunity } from "./create-opportunity-action"
import { TooltipContent } from "@/components/ui/tooltip"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"

interface Props {
  budgets: Array<{ id: string; title: string; monthlyIncomingFlowRate: string }>
  startupId: string
}

export function CreateOpportunity(props: Props) {
  const { budgets, startupId } = props

  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const result = await createOpportunity(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      setOpen(false)
      router.refresh()
      toast.success("Opportunity created successfully!")
    }
  }

  if (budgets.length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex flex-col items-center">
          <div className="flex min-w-64 shrink-0 cursor-pointer flex-col justify-between rounded-lg border border-dashed border-muted-foreground/50 p-4 transition-colors hover:border-primary">
            <div>
              <div className="mt-2 flex flex-row justify-start gap-x-1.5">
                <Badge variant="outline" className="py-0 text-[11px]">
                  Manage
                </Badge>
              </div>

              <h3 className="mt-3 text-sm font-medium">Hire someone</h3>

              <div className="text-xs text-muted-foreground">Create a job posting</div>

              <div className="mt-3">
                <Button size="sm" className="py-0.5" variant="secondary">
                  + Post job
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Opportunity</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="startupId" value={startupId} />
          <div className="space-y-1.5">
            <Label htmlFor="position" className="text-xs">
              Position Name
            </Label>
            <Input id="position" name="position" placeholder="e.g. Artist" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the role and responsibilities..."
              className="min-h-[140px]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="applicationRequirements" className="text-xs">
              Application process
            </Label>
            <Textarea
              id="applicationRequirements"
              name="applicationRequirements"
              placeholder="Other questions or info you want to ask from the applicant..."
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="flowId" className="text-xs">
              Budget
            </Label>
            <Select name="flowId" required defaultValue={budgets[0].id}>
              <SelectTrigger>
                <SelectValue placeholder="Select a budget" />
              </SelectTrigger>
              <SelectContent>
                {budgets.map((budget) => (
                  <SelectItem key={budget.id} value={budget.id}>
                    {budget.title} - <Currency>{budget.monthlyIncomingFlowRate}</Currency> /mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="expectedMonthlySalary" className="text-xs">
                Expected monthly salary
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground hover:bg-muted/80"
                  >
                    ?
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm font-medium">How much to pay this person monthly?</p>
                  <p className="max-w-xs text-xs">
                    Budgets may change but give your best guess based on current budget and how many
                    people you plan to hire.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="relative">
              <Input
                id="expectedMonthlySalary"
                name="expectedMonthlySalary"
                placeholder="250"
                required
                type="number"
                min={5}
                max={1e6}
                className="pl-6"
              />
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Opportunity"}
    </Button>
  )
}
