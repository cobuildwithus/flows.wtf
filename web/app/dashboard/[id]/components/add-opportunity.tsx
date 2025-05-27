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
import { createOpportunity } from "./create-opportunity"

interface Props {
  budgets: Array<{ id: string; title: string; monthlyIncomingFlowRate: string }>
  startupId: string
}

export function AddOpportunity(props: Props) {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex shrink-0 flex-col items-center">
          <div className="flex w-56 grow cursor-pointer flex-col justify-between rounded-lg border border-dashed border-muted-foreground/50 p-4 transition-colors hover:border-primary">
            <div>
              <Badge variant="outline" className="py-0 text-[11px]">
                Manage
              </Badge>
              <h3 className="mt-2.5 text-sm font-medium">Add Opportunity</h3>
              <div className="mt-0.5 text-xs text-muted-foreground">Create a new job posting</div>
            </div>
            <Button size="sm" className="mt-3 py-0.5" variant="secondary">
              + Add new
            </Button>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Opportunity</DialogTitle>
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
              placeholder="What types of information you want to collect from the applicant? Examples: portfolio link, DAO memberships or involvements, social profiles, etc."
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
