"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Currency } from "@/components/ui/currency"
import { Button } from "@/components/ui/button"
import { ApplyOpportunity } from "@/app/startup/[id]/components/apply-opportunity"
import { getIpfsUrl } from "@/lib/utils"
import type { OpportunityWithCount, FlowWithDisplayAmount } from "./types"

interface Props {
  opportunities: OpportunityWithCount[]
  flows: FlowWithDisplayAmount[]
}

const cardClass =
  "h-full rounded-lg border border-border/60 bg-background/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md" as const

function OpportunityCard({ opportunity }: { opportunity: OpportunityWithCount }) {
  return (
    <Card className={cardClass}>
      <CardContent className="flex flex-col items-start gap-4 p-4">
        <div className="flex w-full items-center gap-4">
          <div className="group flex flex-1 items-center gap-3">
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

          {/* Apply button wrapper */}
          <div className="w-max shrink-0">
            <ApplyOpportunity
              opportunityId={opportunity.id}
              position={opportunity.position}
              startupId={opportunity.startupId}
              size="sm"
            />
          </div>
        </div>
        <Link href={`/startup/${opportunity.startupId}`} className="block w-full">
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {opportunity.startup?.shortMission}
          </p>
        </Link>
      </CardContent>
    </Card>
  )
}

function FlowCard({ flow }: { flow: FlowWithDisplayAmount }) {
  return (
    <Card className={cardClass}>
      <CardContent className="flex flex-col items-start gap-4 p-4">
        <div className="flex w-full items-center gap-4">
          <Link href={`/apply/${flow.id}`} className="group flex flex-1 items-center gap-3">
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
                <Currency flow={flow}>{Number(flow.displayAmount)}</Currency>/mo
              </Badge>
            </div>
          </Link>

          <Link href={`/apply/${flow.id}`}>
            <Button variant="outline" size="sm">
              Apply
            </Button>
          </Link>
        </div>
        <Link href={`/apply/${flow.id}`} className="block w-full">
          <p className="line-clamp-2 text-xs text-muted-foreground">{flow.tagline}</p>
        </Link>
      </CardContent>
    </Card>
  )
}

export function OpportunitiesFlowsList({ opportunities, flows }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {opportunities.map((opportunity) => (
        <OpportunityCard key={opportunity.id} opportunity={opportunity} />
      ))}
      {flows.map((flow) => (
        <FlowCard key={flow.id} flow={flow} />
      ))}
    </div>
  )
}
