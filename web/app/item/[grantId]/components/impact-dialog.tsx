"use client"

import React from "react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Grant, DerivedData } from "@prisma/flows"
import { Grade } from "./grade"
import { GrantHeader } from "./grant-header"
import { CircularProgress } from "./circular-progress"
import { PendingEvaluation } from "./pending-evaluation"
import type { User } from "@/lib/auth/user"
import type { RequirementMetric } from "./requirements-section"
import { RequirementsSection } from "./requirements-section"

interface Props {
  grants: Array<
    Pick<Grant, "id" | "title" | "image"> & {
      derivedData: Pick<DerivedData, "overallGrade" | "requirementsMetrics"> | null
      flow: Pick<Grant, "title">
    }
  >
  dialogTitle?: string
  user?: User
}

interface GrantWithScore {
  grant: Props["grants"][0]
  overallScore: number
  requirementsMetrics?: RequirementMetric[]
}

export function ImpactDialog(props: Props) {
  const { grants, dialogTitle, user } = props

  // Return pending if any grant has no grades
  if (grants.some((grant) => !grant.derivedData?.overallGrade)) {
    return <PendingEvaluation user={user} />
  }

  const grantsWithScores: GrantWithScore[] = getGrantsWithScoresAndMetrics(grants)
  const lowestScoringGrant = getLowestScoringGrant(grants)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer space-y-6 rounded-xl border bg-card p-5 transition-all duration-300 hover:scale-[1.01] hover:border-primary/10">
          <div className="flex items-center space-x-4">
            <CircularProgress value={lowestScoringGrant.overallScore} />
            <span className="font-medium">{dialogTitle || "Impact Score"}</span>
          </div>

          <div className="space-y-4">
            {lowestScoringGrant.requirementsMetrics
              ?.slice(0, 4)
              .sort((a, b) => b.met - a.met)
              .map(({ name, met, explanation }) => (
                <Grade
                  key={name}
                  label={name}
                  value={met}
                  percentage={met}
                  explanation={explanation}
                />
              ))}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl">
        <DialogTitle className="text-center text-2xl font-bold" />
        <div className="mt-2 flex flex-col space-y-16">
          {grantsWithScores.map(({ grant, requirementsMetrics }) => (
            <div key={grant.id} className="space-y-6 first:mt-0 last:mb-0">
              <GrantHeader grant={grant} />
              {requirementsMetrics && <RequirementsSection requirements={requirementsMetrics} />}
            </div>
          ))}
        </div>

        <div className="mt-4 text-right text-xs text-muted-foreground">
          {lowestScoringGrant.overallScore < 90
            ? "*Calculated every 2 days on new updates. Based on last 3 months of updates"
            : "*Calculated every 2 weeks. Based on last 3 months of updates"}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getLowestScoringGrant(grants: Props["grants"]) {
  const grantsWithScores = getGrantsWithScoresAndMetrics(grants)
  return grantsWithScores.sort((a, b) => a.overallScore - b.overallScore)[0]
}

function getGrantsWithScoresAndMetrics(grants: Props["grants"]) {
  return grants.map((grant) => {
    const overallScore = Math.ceil(grant.derivedData?.overallGrade || 0)
    const requirementsMetrics = grant.derivedData
      ?.requirementsMetrics as unknown as RequirementMetric[]
    return { grant, overallScore, requirementsMetrics }
  })
}
