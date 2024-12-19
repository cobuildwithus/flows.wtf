import { Voters } from "@/app/item/[grantId]/cards/voters"
import { CurationCard } from "@/app/item/[grantId]/components/curation-card"
import { UserVotes } from "@/app/item/[grantId]/components/user-votes"
import { AnimatedSalary } from "@/components/global/animated-salary"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Currency } from "@/components/ui/currency"
import { Markdown } from "@/components/ui/markdown"
import { getFlowWithGrants } from "@/lib/database/queries/flow"
import { getPool } from "@/lib/database/queries/pool"
import { getEthAddress } from "@/lib/utils"
import Link from "next/link"
import { Suspense } from "react"

export const runtime = "nodejs"

interface Props {
  params: Promise<{ flowId: string }>
}

export default async function GrantPage(props: Props) {
  const params = await props.params
  const { flowId } = params

  const flow = await getFlowWithGrants(flowId)
  const pool = await getPool()

  const { description, parentContract } = flow

  return (
    <div className="container mt-2.5 pb-24 md:mt-6">
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <div className="mb-12 mt-6 space-y-5 text-pretty text-sm">
            <Markdown>{description}</Markdown>
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>About</CardTitle>
                <Link href={`/flow/${flowId}`}>
                  <Button variant="outline" size="sm">
                    View grants
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Budget</h4>
                  <Badge className="mt-2">
                    <Currency>{flow.monthlyIncomingFlowRate}</Currency>
                    /mo
                  </Badge>
                </div>
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Paid out</h4>
                  <p className="mt-1 text-lg font-medium">
                    <AnimatedSalary
                      value={flow.totalEarned}
                      monthlyRate={flow.monthlyIncomingFlowRate}
                    />
                  </p>
                </div>
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Community Votes</h4>
                  <p className="mt-1 text-lg font-medium">{flow.votesCount}</p>
                </div>
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Your Vote</h4>
                  <p className="mt-1 text-lg font-medium">
                    <UserVotes recipientId={flow.id} contract={getEthAddress(parentContract)} />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <CurationCard grant={flow} flow={pool} />

          <Suspense>
            <Voters
              contract={flow.parentContract as `0x${string}`}
              grantId={flow.id}
              flowVotesCount={pool.votesCount}
              isFlow={true}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
