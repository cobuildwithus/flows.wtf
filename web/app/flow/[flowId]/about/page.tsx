import { Voters } from "@/app/item/[grantId]/cards/voters"
import { CurationStatus, CurationVote } from "@/app/item/[grantId]/components/curation-card"
import { UserVotes } from "@/app/item/[grantId]/components/user-votes"
import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { AnimatedSalary } from "@/components/global/animated-salary"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Currency } from "@/components/ui/currency"
import { Markdown } from "@/components/ui/markdown"
import { getFlowWithGrants } from "@/lib/database/queries/flow"
import { getPool } from "@/lib/database/queries/pool"
import { Status } from "@/lib/enums"
import { getEthAddress } from "@/lib/utils"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getUser } from "@/lib/auth/user"
import Link from "next/link"
import { Suspense } from "react"
import { GrantChat } from "@/app/item/[grantId]/components/grant-chat"

interface Props {
  params: Promise<{ flowId: string }>
}

export default async function FlowPage(props: Props) {
  const params = await props.params
  const { flowId } = params

  const flow = await getFlowWithGrants(flowId)
  const pool = await getPool()
  const user = await getUser()

  const { description, parentContract, isTopLevel } = flow

  return (
    <div className="container mt-2.5 max-w-6xl pb-24 md:mt-6">
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-5">
        <AgentChatProvider
          id={`flow-${flowId}-${user?.address}`}
          type="flo"
          user={user}
          data={{ grantId: flowId }}
          identityToken={await getPrivyIdToken()}
        >
          <div className="md:col-span-3">
            <div className="mb-12 mt-6 space-y-5 text-pretty text-sm">
              <Markdown>{description}</Markdown>
            </div>
          </div>

          <div className="space-y-4 md:col-span-2">
            {!isTopLevel && (
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
                      <h4 className="text-[13px] text-muted-foreground">Votes</h4>
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
            )}

            {!isTopLevel && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <span className="flex items-center justify-between font-medium">
                      Status
                      {flow.status === Status.ClearingRequested && (
                        <Badge variant="warning" className="font-medium">
                          Challenged
                        </Badge>
                      )}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CurationStatus grant={flow} flow={pool} />
                </CardContent>
              </Card>
            )}

            {flow.isDisputed && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Vote</CardTitle>
                </CardHeader>
                <CardContent>
                  <CurationVote grant={flow} />
                </CardContent>
              </Card>
            )}

            {!isTopLevel && (
              <Card>
                <CardHeader>
                  <CardTitle>Voters</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense>
                    <Voters
                      contract={flow.parentContract as `0x${string}`}
                      grantId={flow.id}
                      flowVotesCount={pool.votesCount}
                      isFlow={true}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            )}
          </div>
          <GrantChat user={user} grant={flow} canEdit={false} />
        </AgentChatProvider>
      </div>
    </div>
  )
}
