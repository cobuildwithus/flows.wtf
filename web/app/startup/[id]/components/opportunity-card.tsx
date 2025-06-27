"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User as UserType } from "@/lib/auth/user"
import { Trash, User } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import pluralize from "pluralize"
import { useState } from "react"
import { toast } from "sonner"
import { ApplyOpportunity } from "./apply-opportunity"
import { CopyOpportunityLink } from "./copy-opportunity-link"
import { deleteOpportunity } from "./delete-opportunity"
import { ApplicationWithProfile, ViewApplications } from "./view-applications"

interface Props {
  id: string
  title: string
  applicationsCount: number
  canManage: boolean
  applications: ApplicationWithProfile[]
  user: UserType | undefined
  flowContract: `0x${string}`
  expectedMonthlySalary: number
  startupId: string
  chainId: number
}

export function OpportunityCard(props: Props) {
  const {
    id,
    title,
    applicationsCount,
    canManage,
    applications,
    flowContract,
    expectedMonthlySalary,
    user,
    startupId,
    chainId,
  } = props
  const router = useRouter()
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

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
    <div className="flex flex-col items-center">
      <div
        className="flex min-w-64 shrink-0 items-center space-x-4 rounded-lg border border-dashed border-muted-foreground/50 p-4 transition-colors hover:border-primary"
        onMouseEnter={() => !canManage && setIsHovered(true)}
        onMouseLeave={() => !canManage && setIsHovered(false)}
      >
        {!canManage && (
          <div className="relative size-16 min-w-16 overflow-hidden rounded-full bg-muted">
            <User
              className={`absolute inset-0 m-auto size-8 text-muted-foreground transition-all duration-300 ease-in-out ${
                isHovered && user?.avatar ? "scale-75 opacity-0" : "scale-100 opacity-100"
              }`}
            />
            {user?.avatar && (
              <Image
                src={user.avatar}
                alt={user.username || "User"}
                width={64}
                height={64}
                className={`size-16 rounded-full object-cover transition-all duration-500 ease-in-out ${
                  isHovered ? "scale-100 opacity-100" : "scale-110 opacity-0"
                }`}
              />
            )}
          </div>
        )}
        <div className="flex w-full flex-col">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                <Badge variant="secondary" className="shrink-0">
                  ${expectedMonthlySalary}/mo
                </Badge>
                <Badge variant="secondary" className="shrink-0">
                  Hiring
                </Badge>
              </div>
              <CopyOpportunityLink
                flowContract={flowContract}
                opportunityId={id}
                startupId={startupId}
                position={title}
              />
            </div>

            <h3 className="mt-2 text-sm font-medium">{title}</h3>

            {canManage && (
              <div className="text-xs text-muted-foreground">
                {pluralize("application", applicationsCount, true)}
              </div>
            )}
            {!canManage && (
              <div className="mt-3">
                <ApplyOpportunity
                  size="sm"
                  opportunityId={id}
                  position={title}
                  startupId={startupId}
                />
              </div>
            )}
            {canManage && (
              <div className="mt-3 flex w-full items-center justify-between gap-x-1.5">
                <Button
                  size="sm"
                  className="flex-1 py-0.5"
                  disabled={applicationsCount === 0}
                  onClick={() => setIsViewModalOpen(true)}
                >
                  View applications
                </Button>
                <Button size="sm" variant="ghost" className="py-0.5" onClick={handleDelete}>
                  <Trash className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ViewApplications
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        opportunityTitle={title}
        applications={applications}
        flowContract={flowContract}
        chainId={chainId}
      />
    </div>
  )
}
