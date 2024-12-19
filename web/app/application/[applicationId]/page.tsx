import { DisputeUserVote } from "@/app/components/dispute/dispute-user-vote"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Markdown } from "@/components/ui/markdown"
import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database/edge"
import { getEthAddress, getIpfsUrl, isProduction } from "@/lib/utils"
import { Metadata } from "next"
import Image from "next/image"
import { redirect } from "next/navigation"
import { StatusDisputed } from "./components/status-disputed"
import { StatusNotDisputed } from "./components/status-not-disputed"

export const runtime = "nodejs"

interface Props {
  params: Promise<{
    applicationId: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { applicationId } = await props.params

  const grant = await database.grant.findFirstOrThrow({
    where: { id: applicationId },
  })

  return { title: grant.title, description: grant.tagline }
}

export default async function ApplicationPage(props: Props) {
  const params = await props.params
  const { applicationId } = params

  const grant = await database.grant.findUniqueOrThrow({
    where: { id: applicationId },
    include: { flow: true, disputes: true },
  })

  if (grant.isActive && isProduction()) return redirect(`/item/${grant.id}`)

  const { title, description, flow, image, createdAt, isFlow, isTopLevel } = grant

  const dispute = grant.disputes[0]

  return (
    <div className="container mt-2.5 pb-24 md:mt-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Flows</BreadcrumbLink>
          </BreadcrumbItem>

          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink href={`/flow/${flow.id}/applications`}>
                {flow.title} Applications
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-20">
        <div className="md:col-span-3">
          <div className="flex items-center space-x-4">
            <Image
              src={getIpfsUrl(image)}
              alt={title}
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-md"
            />
            <div>
              <h1 className="text-xl font-bold md:text-3xl">{title}</h1>
            </div>
          </div>
          <div className="mt-6 space-y-5 text-pretty text-sm md:text-base">
            <Markdown>{description}</Markdown>
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[13px] text-muted-foreground">
                    {isTopLevel ? "Proposer" : "Builder"}
                  </h4>
                  <div className="mt-1 flex space-x-0.5">
                    <UserProfile
                      address={getEthAddress(grant.isFlow ? grant.submitter : grant.recipient)}
                    >
                      {(profile) => (
                        <Avatar className="size-7 bg-accent text-xs">
                          <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                          <AvatarFallback>{profile.display_name[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                    </UserProfile>
                  </div>
                </div>
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Created At</h4>
                  <DateTime
                    className="text-sm"
                    date={new Date(createdAt * 1000)}
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
                  <p className="text-sm">{isFlow ? "Flow" : "Grant"}</p>
                </div>

                <div>
                  <h4 className="mb-1 text-[13px] text-muted-foreground">Challenged</h4>
                  <p className="text-sm">{grant.isDisputed ? "Yes" : "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Application status</CardTitle>
            </CardHeader>
            <CardContent>
              {!grant.isDisputed && !grant.isResolved && (
                <StatusNotDisputed grant={grant} flow={flow} />
              )}
              {(grant.isDisputed || grant.isResolved) && dispute && (
                <StatusDisputed grant={grant} dispute={dispute} flow={flow} />
              )}
            </CardContent>
          </Card>
          {dispute && (
            <Card>
              <CardHeader>
                <CardTitle>Your vote</CardTitle>
              </CardHeader>
              <CardContent>
                <DisputeUserVote grant={grant} flow={flow} dispute={dispute} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
