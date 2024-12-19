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
import database from "@/lib/database/edge"
import { getTcrCosts } from "@/lib/tcr/get-tcr-costs"
import { getEthAddress } from "@/lib/utils"
import { Metadata } from "next"
import { Suspense } from "react"
import { CreatorCard } from "./creator-card"
import DraftContent from "./draft-content"
import { DraftEditButton } from "./draft-edit-button"
import { DraftPublishButton } from "./draft-publish-button"

export const runtime = "nodejs"

interface Props {
  params: Promise<{
    draftId: string
  }>
  searchParams: Promise<{
    edit?: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { draftId } = await props.params

  const draft = await database.draft.findFirstOrThrow({
    where: { id: Number(draftId) },
  })

  return { title: draft.title, description: draft.tagline }
}

export default async function DraftPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { draftId } = params

  const draft = await database.draft.findUniqueOrThrow({
    where: { id: Number(draftId), isPrivate: false },
    include: { flow: { include: { derivedData: true } } },
  })

  const { title, flow, isOnchain, createdAt, users, isFlow, description } = draft

  const costs = getTcrCosts(flow)
  const edit = searchParams.edit === "true"

  return (
    <div className="container mt-2.5 flex grow flex-col pb-12 md:mt-6">
      <div className="flex flex-col max-md:space-y-4 md:flex-row md:items-center md:justify-between">
        <Breadcrumb className="mb-4 mr-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Flows</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink href={`/flow/${flow.id}/drafts`}>{flow.title} Drafts</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center space-x-1.5">
          <DraftEditButton draft={draft} edit={edit} />
          {!isOnchain && !edit && <DraftPublishButton draft={draft} flow={flow} />}
        </div>
      </div>

      <div className="mt-8 grid grow grid-cols-1 gap-8 md:grid-cols-5 md:gap-20">
        <div className="md:col-span-3">
          <DraftContent draft={draft} edit={edit} markdown={description} />
        </div>

        <div className="space-y-4 md:col-span-2">
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
                <div className="max-sm:text-sm">
                  <h4 className="text-[13px] text-muted-foreground">Created At</h4>
                  <DateTime
                    date={createdAt}
                    options={{
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    }}
                  />
                </div>

                <div>
                  <h4 className="mb-1 text-[13px] text-muted-foreground">Type</h4>
                  <p className="max-sm:text-sm">{isFlow ? "Flow" : "Grant"}</p>
                </div>

                <div>
                  <h4 className="mb-1 text-[13px] text-muted-foreground">Is onchain?</h4>
                  {isOnchain ? <p>Yes</p> : <p>No</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Suspense>
            <CreatorCard
              draft={draft}
              cost={(await costs).addItemCost}
              symbol={(await costs).symbol}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
