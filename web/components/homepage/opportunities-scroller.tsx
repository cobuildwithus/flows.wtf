"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import { ApplyOpportunity } from "@/app/startup/[id]/components/apply-opportunity"
import { getIpfsUrl } from "@/lib/utils"
import type { OpportunityWithCount, FlowWithDisplayAmount } from "./types"

interface Props {
  opportunities: OpportunityWithCount[]
  flows: FlowWithDisplayAmount[]
}

export function OpportunitiesScroller({ opportunities, flows }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Take top 5 from each list
  const topOpportunities = opportunities.slice(0, 7)
  const topFlows = flows.slice(0, 7)

  // Combine opportunities and flows into a single array with type discrimination
  const allItems = [
    ...topOpportunities.map((o) => ({ type: "opportunity" as const, data: o })),
    ...topFlows.map((f) => ({ type: "flow" as const, data: f })),
  ]

  // Duplicate for infinite scroll
  const duplicatedItems = [...allItems, ...allItems]

  const handleMouseEnter = () => {
    if (scrollRef.current) {
      scrollRef.current.style.animationPlayState = "paused"
    }
  }

  const handleMouseLeave = () => {
    if (scrollRef.current) {
      scrollRef.current.style.animationPlayState = "running"
    }
  }

  if (allItems.length === 0) return null

  return (
    <div
      className="relative overflow-x-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={scrollRef}
        className="flex animate-infinite-scroll gap-4"
        style={{ width: "max-content" }}
      >
        {duplicatedItems.map((item, index) => (
          <div key={`${item.type}-${item.data.id}-${index}`} className="w-80 flex-shrink-0">
            {item.type === "opportunity" ? (
              <OpportunityScrollerCard opportunity={item.data} />
            ) : (
              <FlowScrollerCard flow={item.data} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function OpportunityScrollerCard({ opportunity }: { opportunity: OpportunityWithCount }) {
  return (
    <div className="group h-full rounded-lg border border-border/60 bg-background/80 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex flex-1 items-center gap-3">
          {opportunity.startup && (
            <Image
              src={getIpfsUrl(opportunity.startup.image, "pinata")}
              alt={opportunity.startup.title}
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-full object-cover ring-1 ring-border"
            />
          )}

          <div className="min-w-0 flex-1">
            <Link
              href={`/startup/${opportunity.startupId}`}
              className="transition-colors hover:text-primary"
            >
              <h4 className="line-clamp-1 text-sm font-semibold">
                {opportunity.position} • {opportunity.startup?.title}
              </h4>
            </Link>
            <Badge variant="secondary" className="mt-1 text-xs">
              <Currency>{opportunity.expectedMonthlySalary}</Currency>/mo
            </Badge>
          </div>
        </div>

        <div className="shrink-0">
          <ApplyOpportunity
            opportunityId={opportunity.id}
            position={opportunity.position}
            startupId={opportunity.startupId}
            size="sm"
          />
        </div>
      </div>
    </div>
  )
}

function FlowScrollerCard({ flow }: { flow: FlowWithDisplayAmount }) {
  return (
    <Link href={`/apply/${flow.id}`} className="block h-full">
      <div className="group h-full rounded-lg border border-border/60 bg-background/80 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex flex-1 items-center gap-3">
            <Image
              src={getIpfsUrl(flow.image)}
              alt={flow.title}
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-full object-cover ring-1 ring-border"
            />

            <div className="min-w-0 flex-1">
              <h4 className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary">
                {flow.title}
              </h4>
              <Badge variant="secondary" className="mt-1 text-xs">
                <Currency display={flow}>{Number(flow.displayAmount)}</Currency>/mo
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
