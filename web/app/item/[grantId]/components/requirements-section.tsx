"use client"

import React from "react"
import { RequirementsCard } from "./requirements-card"

export interface RequirementMetric {
  requirement: string
  met: number
  name: string
  explanation: string
  tips: string[] | null
}

/**
 * A small wrapper that controls whether all requirement cards are open or closed.
 */
export function RequirementsSection({
  requirements,
  flowTitle,
}: {
  requirements: RequirementMetric[]
  flowTitle: string
}) {
  return (
    <div className="space-y-3">
      <div className="text-left font-medium text-muted-foreground">{flowTitle} Requirements</div>
      <div className="mt-2 columns-1 gap-4 [column-fill:_balance] md:columns-2 lg:columns-3">
        {requirements.map((requirement) => (
          <div key={requirement.name} className="mb-4 break-inside-avoid">
            <RequirementsCard
              title={requirement.name}
              score={requirement.met}
              explanation={requirement.explanation}
              tips={requirement.tips ?? undefined}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
