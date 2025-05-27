"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import pluralize from "pluralize"
import { toast } from "sonner"
import { deleteOpportunity } from "./delete-opportunity"
import { ApplyOpportunity } from "./apply-opportunity"
import { ApplicationWithProfile, ViewOpportunities } from "./view-opportunities"
import { User } from "@/lib/auth/user"
import { Draft } from "@prisma/flows"
import { useState } from "react"

interface Props {
  id: string
  title: string
  applicationsCount: number
  canManage: boolean
  user: User | undefined
  applications: ApplicationWithProfile[]
}

export function OpportunityCard(props: Props) {
  const { id, title, applicationsCount, canManage, user, applications } = props
  const router = useRouter()
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this opportunity?")) {
      return
    }

    const result = await deleteOpportunity(id)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Opportunity deleted successfully!")
      router.refresh()
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className="flex w-56 grow flex-col justify-between rounded-lg border border-dashed border-muted-foreground/50 p-4 transition-colors hover:border-primary">
        <div>
          <div className="flex items-center justify-between gap-x-1.5">
            <Badge variant="warning" className="py-0 text-[11px]">
              Vacancy
            </Badge>
            {canManage && (
              <Button size="sm" variant="ghost" className="py-0.5" onClick={handleDelete}>
                <Trash className="size-3.5" />
              </Button>
            )}
          </div>
          <h3 className="mt-2.5 text-sm font-medium">{title}</h3>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {pluralize("application", applicationsCount, true)}
          </div>
        </div>
        {!canManage && <ApplyOpportunity user={user} opportunityId={id} position={title} />}
        {canManage && (
          <Button
            size="sm"
            className="mt-3 py-0.5"
            disabled={applicationsCount === 0}
            onClick={() => setIsViewModalOpen(true)}
          >
            View applications
          </Button>
        )}
      </div>

      <ViewOpportunities
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        opportunityTitle={title}
        applications={applications}
      />
    </div>
  )
}
