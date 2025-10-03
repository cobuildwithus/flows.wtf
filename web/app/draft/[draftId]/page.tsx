import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateTime } from "@/components/ui/date-time"
import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database/flows-db"
import { getTcrCosts } from "@/lib/tcr/get-tcr-costs"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import type { Metadata } from "next"
import { Suspense } from "react"
import { CreatorCard } from "./components/creator-card"
import DraftContent from "./components/draft-content"
import { DraftEditButton } from "./components/draft-edit-button"
import { TCRDraftPublishButton } from "./components/tcr-draft-publish-button"
import { getUser } from "@/lib/auth/user"
import { ManagedFlowDraftPublishButton } from "./components/self-managed-draft-publish-button"
import { GrantFeedback } from "@/app/item/[grantId]/components/grant-feedback"
import { getFeedbackCastsForDraft } from "@/lib/database/queries/get-grant-feedback"
import { getFarcasterUserByEthAddress } from "@/lib/farcaster/get-user"
import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { DraftChat } from "./components/draft-chat"

interface Props {
  params: Promise<{ draftId: string }>
  searchParams: Promise<{ edit?: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { draftId } = await props.params

  const draft = await database.draft.findFirstOrThrow({
    where: { id: Number(draftId) },
  })

  return {
    title: draft.title,
    description: draft.tagline,
    openGraph: { images: [getIpfsUrl(draft.image, "pinata")] },
  }
}

export default async function DraftPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { draftId } = params

  const draft = await database.draft.findUniqueOrThrow({
    where: { id: Number(draftId), isPrivate: false },
    include: { flow: { include: { derivedData: true } }, opportunity: true },
  })

  const [existingGrants, user, costs, identityToken] = await Promise.all([
    database.grant.count({
      where: {
        recipient: draft.users[0],
        isActive: true,
        monthlyIncomingBaselineFlowRate: { not: "0" },
      },
    }),
    getUser(),
    getTcrCosts(draft.flow.tcr, draft.flow.erc20, draft.flow.chainId),
    getPrivyIdToken(),
  ])

  const { title, flow, isOnchain, users, description, opportunity } = draft
  const isTcrFlow = flow.tcr && flow.erc20 && flow.tokenEmitter
  const isManager = flow.manager === user?.address

  const edit = searchParams.edit === "true"

  const flowLink = flow.isOnchainStartup ? `/startup/${flow.id}` : `/flow/${flow.id}/drafts`

  return (
    <div className="container mt-2.5 flex grow flex-col pb-12 md:mt-6">
      <AgentChatProvider
        id={`draft-${draft.id}-${user?.address}`}
        type="flo"
        user={user}
        data={{ draftId: `${draft.id}` }}
        identityToken={identityToken}
      >
        <div className="flex flex-col max-md:space-y-4 md:flex-row md:items-center md:justify-between">
          <Breadcrumb className="mb-4 mr-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Flows</BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbLink href={flowLink}>{flow.title} Drafts</BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          {!isOnchain && (
            <div className="flex items-center space-x-1.5">
              <DraftEditButton draft={draft} edit={edit} />
              {!edit && (
                <>
                  {isTcrFlow && (
                    <TCRDraftPublishButton
                      grantsCount={existingGrants}
                      draft={draft}
                      flow={flow}
                      chainId={flow.chainId}
                      user={user}
                      tcrAddress={getEthAddress(flow.tcr as `0x${string}`)}
                      erc20Address={getEthAddress(flow.erc20 as `0x${string}`)}
                      tokenEmitterAddress={getEthAddress(flow.tokenEmitter as `0x${string}`)}
                    />
                  )}
                  {isManager && (
                    <ManagedFlowDraftPublishButton draft={draft} flow={flow} user={user} />
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 grid grow grid-cols-1 gap-8 md:grid-cols-5 md:gap-20">
          <div className="md:col-span-3">
            <DraftContent draft={draft} edit={edit} markdown={description} />
          </div>

          <div className="space-y-4 md:col-span-2">
            {opportunity && (
              <Card>
                <CardHeader>
                  <CardTitle>Opportunity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {isOnchain ? "Hired for the " : "Applied for the "}
                    <strong>{opportunity.position}</strong> opening
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[13px] text-muted-foreground">Builders</h4>
                    <div className="mt-1 flex space-x-0.5">
                      {users.map((user) => (
                        <UserProfile address={getEthAddress(user)} key={user}>
                          {(profile) => (
                            <Avatar className="size-7 bg-accent text-xs">
                              <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                            </Avatar>
                          )}
                        </UserProfile>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-1 text-[13px] text-muted-foreground">Onchain</h4>
                    {isOnchain ? <p>Yes</p> : <p>No</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {costs && (
              <Suspense>
                <CreatorCard draft={draft} cost={costs.addItemCost} symbol={costs.symbol} />
              </Suspense>
            )}

            <Suspense>
              <div className="col-span-full xl:col-span-3">
                <GrantFeedback
                  parentUrl={`https://flows.wtf/draft/${draftId}`} // so feedback is linked to the draft
                  className="bg-card shadow"
                  castsPromise={getFeedbackCastsForDraft(draftId)}
                  builderUsername={
                    (await getFarcasterUserByEthAddress(draft.users[0] as `0x${string}`))?.fname ||
                    ""
                  }
                  description="Ask the builder a question"
                  initialMessage="I want to give feedback on this draft"
                />
              </div>
            </Suspense>
          </div>
        </div>
        <DraftChat draft={draft} user={user} />
      </AgentChatProvider>
    </div>
  )
}
