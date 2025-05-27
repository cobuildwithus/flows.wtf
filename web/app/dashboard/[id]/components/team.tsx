import "server-only"

import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { User } from "@/lib/auth/user"
import database from "@/lib/database/edge"
import { isAdmin } from "@/lib/database/helpers"
import { getStartupBudgets } from "@/lib/onchain-startup/budgets"
import { Startup } from "@/lib/onchain-startup/startup"
import { TeamMember } from "@/lib/onchain-startup/team-members"
import Image from "next/image"
import { AddOpportunity } from "./add-opportunity"
import { OpportunityCard } from "./opportunity-card"

interface Props {
  members: TeamMember[]
  user: User | undefined
  startup: Startup
}

export async function Team(props: Props) {
  const { members, user, startup } = props

  const canManage = user?.address === startup.manager || isAdmin(user?.address)
  // const canManage = false

  const budgets = await getStartupBudgets(startup.id, startup.allocator)

  const opportunities = await database.opportunity.findMany({
    select: {
      id: true,
      position: true,
      _count: { select: { applications: true } },
      applications: {
        select: {
          id: true,
          opportunityId: true,
          content: true,
          submitter: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    where: { startupId: startup.id, status: 1 },
  })

  const opportunitiesWithProfiles = await Promise.all(
    opportunities.map(async (opportunity) => {
      const applicationsWithProfiles = await Promise.all(
        opportunity.applications.map(async (application) => {
          const profile = await getUserProfile(application.submitter as `0x${string}`)
          return { ...application, profile }
        }),
      )
      return { ...opportunity, applications: applicationsWithProfiles }
    }),
  )

  return (
    <AgentChatProvider
      id={`startup-${startup.id}-${user?.address}`}
      type="flo"
      user={user}
      data={{ startupId: startup.id }}
      identityToken={await getPrivyIdToken()}
    >
      <div className="relative h-full w-9 shrink-0">
        <div className="absolute left-4 top-5 z-10 origin-right -translate-x-full -rotate-90 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground">
          Meet the team
        </div>
      </div>
      <ScrollArea className="pointer-events-auto mt-2 grow whitespace-nowrap">
        <div className="flex space-x-4">
          {members.map((m) => (
            <TeamMemberCard key={m.recipient} member={m} />
          ))}
          {opportunitiesWithProfiles.map((o) => (
            <OpportunityCard
              key={o.id}
              id={o.id}
              title={o.position}
              applicationsCount={o._count.applications}
              canManage={canManage}
              user={user}
              applications={o.applications}
            />
          ))}
          {canManage && <AddOpportunity budgets={budgets} startupId={startup.id} />}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </AgentChatProvider>
  )
}

async function TeamMemberCard(props: { member: TeamMember }) {
  const { member } = props

  const profile = await getUserProfile(member.recipient as `0x${string}`)
  const { display_name, pfp_url, username } = profile

  return (
    <div className="flex min-w-64 shrink-0 items-center space-x-4 rounded-lg border bg-accent/50 p-4 dark:bg-muted/30">
      <Image
        src={pfp_url || ""}
        alt={display_name}
        width={64}
        height={64}
        className="z-20 size-16 rounded-full"
      />
      <div className="flex flex-col">
        <div>
          <Badge>
            <Currency>{member.monthlyIncomingFlowRate.toString()}</Currency> /mo
          </Badge>
          <h3 className="mt-2.5 text-sm font-medium">
            <a
              href={`https://farcaster.xyz/${username}`}
              className="hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {display_name}
            </a>
          </h3>

          <div className="mb-3 mt-1 text-xs text-muted-foreground">{member.description}</div>
        </div>
      </div>
    </div>
  )
}
