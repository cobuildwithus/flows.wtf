import { Voters } from "@/app/item/[grantId]/cards/voters"
import { CurationVote } from "@/app/item/[grantId]/components/curation-card"
import { UserVotes } from "@/app/item/[grantId]/components/user-votes"
import { AnimatedSalary } from "@/components/global/animated-salary"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Currency } from "@/components/ui/currency"
import { getUser } from "@/lib/auth/user"
import { isAdmin } from "@/lib/database/helpers"
import { getFlowWithGrants } from "@/lib/database/queries/flow"
import { fromWei, getEthAddress } from "@/lib/utils"
import Link from "next/link"
import { Suspense } from "react"
import { EditDescription } from "../components/edit-description"
import { EditMetadataDialog } from "../components/edit-metadata"

interface Props {
  params: Promise<{ flowId: string }>
}

export default async function FlowPage(props: Props) {
  const params = await props.params
  const { flowId } = params

  const flow = await getFlowWithGrants(flowId)
  const user = await getUser()

  const { description, parentContract, isTopLevel, recipient, chainId, manager } = flow
  const canEdit = manager === user?.address || isAdmin(user?.address)

  return (
    <div className="container mt-2.5 max-w-6xl pb-24 md:mt-6">
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <div className="mb-12 mt-6 space-y-5 text-pretty text-sm">
            <EditDescription
              initial={description}
              contract={getEthAddress(recipient)}
              chainId={chainId}
              canEdit={canEdit}
            />
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          {!isTopLevel && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>About</CardTitle>
                  <div className="flex space-x-2">
                    <Link href={`/flow/${flowId}`}>
                      <Button variant="outline" size="sm">
                        View grants
                      </Button>
                    </Link>
                    <EditMetadataDialog
                      flow={flow}
                      contract={getEthAddress(recipient)}
                      chainId={chainId}
                      canEdit={canEdit}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[13px] text-muted-foreground">Budget</h4>
                    <Badge className="mt-2">
                      <Currency display={flow}>
                        {fromWei(flow.monthlyIncomingFlowRate as any)}
                      </Currency>
                      /mo
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-[13px] text-muted-foreground">Paid out</h4>
                    <p className="mt-1 text-lg font-medium">
                      <AnimatedSalary
                        value={fromWei(flow.totalEarned)}
                        monthlyRate={fromWei(flow.monthlyIncomingFlowRate)}
                        grant={{
                          underlyingTokenPrefix: flow.underlyingTokenPrefix ?? undefined,
                          underlyingTokenSymbol: flow.underlyingTokenSymbol ?? undefined,
                        }}
                      />
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[13px] text-muted-foreground">Votes</h4>
                    <p className="mt-1 text-lg font-medium">{String(flow.memberUnits)}</p>
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

          {/* {!isTopLevel && flow.tcr && (
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
          )} */}

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
                <CardTitle>Allocators</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense>
                  <Voters
                    contract={flow.parentContract as `0x${string}`}
                    recipientId={flow.recipientId}
                    isFlow={true}
                  />
                </Suspense>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
