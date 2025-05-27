import "server-only"

import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { User } from "@/lib/auth/user"
import database from "@/lib/database/edge"
import { isAdmin } from "@/lib/database/helpers"
import { getBudgetsWithGrants } from "@/lib/onchain-startup/budgets-with-grants"
import { Startup } from "@/lib/onchain-startup/startup"
import { TeamMember } from "@/lib/onchain-startup/team-members"
import { AddOpportunity } from "./add-opportunity"
import { AllocateBudgets } from "./allocate-budgets"
import { OpportunityCard } from "./opportunity-card"
import { TeamMemberCard } from "./team-member-card"

interface Props {
  members: TeamMember[]
  user: User | undefined
  startup: Startup
}

export async function Team(props: Props) {
  const { members, user, startup } = props

  // const canManage = user?.address === startup.manager || isAdmin(user?.address)
  const canAllocate = user?.address === startup.allocator
  const canManage = false

  const [budgets, privyIdToken, opportunitiesWithProfiles] = await Promise.all([
    getBudgetsWithGrants(startup.id, startup.allocator),
    getPrivyIdToken(),
    getOpportunitiesWithProfiles(startup.id),
  ])

  return (
    <AgentChatProvider
      id={`startup-${startup.id}-${user?.address}`}
      type="flo"
      user={user}
      data={{ startupId: startup.id }}
      identityToken={privyIdToken}
    >
      <div className="relative h-full w-9 shrink-0">
        <div className="absolute left-4 top-5 z-10 origin-right -translate-x-full -rotate-90 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground">
          Meet the team
        </div>
      </div>
      <ScrollArea className="pointer-events-auto mt-2 grow whitespace-nowrap">
        <div className="flex space-x-4">
          <AllocateBudgets
            isAllocator={canAllocate}
            isManager={canManage}
            flows={budgets}
            grants={budgets.map((b) => b.subgrants)}
          >
            {members.map((m) => (
              <TeamMemberCard isAllocator={canManage} key={m.recipient} member={m} />
            ))}
          </AllocateBudgets>
          {opportunitiesWithProfiles.map((o) => (
            <OpportunityCard
              key={o.id}
              id={o.id}
              title={o.position}
              applicationsCount={o._count.drafts}
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

async function getOpportunitiesWithProfiles(startupId: string) {
  const opportunities = await database.opportunity.findMany({
    select: {
      id: true,
      position: true,
      _count: { select: { drafts: true } },
      drafts: true,
    },
    where: { startupId, status: 1 },
  })

  return Promise.all(
    opportunities.map(async (opportunity) => {
      const applicationsWithProfiles = await Promise.all(
        opportunity.drafts.map(async (draft) => {
          const profile = await getUserProfile(draft.users[0] as `0x${string}`)
          return { ...draft, profile }
        }),
      )
      return { ...opportunity, applications: applicationsWithProfiles }
    }),
  )
}
