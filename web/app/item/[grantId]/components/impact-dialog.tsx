"use client"

import React from "react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Grant, DerivedData } from "@prisma/flows"
import { Grade } from "./grade"
import { MetricCard } from "./metric-card"
import { GrantHeader } from "./grant-header"
import { CircularProgress } from "./circular-progress"
import { PendingEvaluation } from "./pending-evaluation"
import { User } from "@/lib/auth/user"
import { RequirementMetric } from "./requirements-section"
import { RequirementsSection } from "./requirements-section"

interface Props {
  grants: Array<
    Pick<Grant, "id" | "title" | "image"> & {
      derivedData: Pick<DerivedData, "grades" | "overallGrade" | "requirementsMetrics"> | null
      flow: Pick<Grant, "title">
    }
  >
  dialogTitle?: string
  user?: User
}

interface Grades {
  [key: string]: {
    score: number
    explanation: string
    metricName: string
    tips: string[]
  }
}

interface GrantWithScore {
  grant: Props["grants"][0]
  grades: Grades
  overallScore: number
  requirementsMetrics?: RequirementMetric[]
}

export function ImpactDialog(props: Props) {
  const { grants, dialogTitle, user } = props

  // Return pending if any grant has no grades
  if (grants.some((grant) => !grant.derivedData?.grades)) {
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
            {Object.entries(lowestScoringGrant.grades)
              .sort(([, a], [, b]) => b.score - a.score)
              .map(([label, { score, explanation, metricName }]) => (
                <Grade
                  key={label}
                  label={metricName}
                  value={score}
                  percentage={score}
                  explanation={explanation}
                />
              ))}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl">
        <DialogTitle className="text-center text-2xl font-bold" />
        <div className="mt-2 flex flex-col space-y-16">
          {grantsWithScores.map(({ grant, grades, requirementsMetrics }) => (
            <div key={grant.id} className="space-y-6 first:mt-0 last:mb-0">
              <GrantHeader grant={grant} />
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(grades)
                  .sort(([, a], [, b]) => b.score - a.score)
                  .map(([label, metric]) => (
                    <MetricCard key={label} {...metric} title={metric.metricName} />
                  ))}
              </div>
              {requirementsMetrics && (
                <RequirementsSection
                  requirements={requirementsMetrics}
                  flowTitle={grant.flow.title}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 text-right text-xs text-muted-foreground">
          {lowestScoringGrant.overallScore < 90
            ? "*Scores update every 2 days when updates are posted"
            : "*Scores update every 2 weeks"}
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
    const grades = grant.derivedData?.grades as unknown as Grades
    const overallScore = Math.ceil(
      grant.derivedData?.overallGrade ||
        Object.values(grades).reduce((acc, { score }) => acc + score, 0) /
          Object.keys(grades).length,
    )
    const requirementsMetrics = grant.derivedData
      ?.requirementsMetrics as unknown as RequirementMetric[]
    return { grant, grades, overallScore, requirementsMetrics }
  })
}
