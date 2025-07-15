import { ApplyOpportunity } from "@/app/startup/[id]/components/apply-opportunity"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Currency } from "@/components/ui/currency"
import { getStartupData } from "@/lib/onchain-startup/startup"
import { getIpfsUrl } from "@/lib/utils"
import type { Opportunity } from "@prisma/flows"
import Image from "next/image"
import Link from "next/link"
import pluralize from "pluralize"

interface Props {
  opportunity: Opportunity & { _count: { drafts: number } }
}

export function OpportunityItem(props: Props) {
  const { opportunity } = props

  const { id, startupId, position, expectedMonthlySalary, _count } = opportunity

  const startup = getStartupData(startupId)

  return (
    <Card key={id} className="shadow-none transition-all hover:shadow-md">
      <CardContent className="flex items-center gap-6 p-6">
        <Image
          src={getIpfsUrl(startup.image, "pinata")}
          alt={`${startup.title}`}
          width={64}
          height={64}
          className="size-16 shrink-0 rounded-lg object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link
              href={`/startup/${startupId}`}
              className="font-semibold transition-colors hover:text-primary"
            >
              {startup.title}
            </Link>
            {startup.shortMission && (
              <>
                <span>•</span>
                <span className="line-clamp-1 truncate">{startup.shortMission}</span>
              </>
            )}
          </div>

          <h3 className="mt-2 text-xl font-semibold tracking-tight">{position}</h3>

          <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
            <Badge variant="secondary">
              <Currency>{expectedMonthlySalary}</Currency>/mo
            </Badge>

            <Badge variant="secondary">{pluralize("applicant", _count.drafts, true)}</Badge>
          </div>
        </div>

        <div className="shrink-0">
          <ApplyOpportunity opportunityId={id} position={position} startupId={startupId} />
        </div>
      </CardContent>
    </Card>
  )
}
