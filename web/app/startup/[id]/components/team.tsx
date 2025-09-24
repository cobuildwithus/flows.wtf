import "server-only"

import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { User } from "@/lib/auth/user"
import database from "@/lib/database/flows-db"
import { isAdmin } from "@/lib/database/helpers"
import { BudgetWithGrants, getBudgetsWithGrants } from "@/lib/onchain-startup/budgets-with-grants"
import { Startup } from "@/lib/onchain-startup/startup"
import { TeamMember } from "@/lib/onchain-startup/team-members"
import { cn } from "@/lib/utils"
import { CreateOpportunity } from "./create-opportunity"
import { AllocateBudgets } from "./allocate-budgets"
import { OpportunityCard } from "./opportunity-card"
import { TeamMemberCard } from "./team-member-card"
import { HireDirectly } from "./hire-directly"

interface Props {
  members: TeamMember[]
  user: User | undefined
  startup: Startup
}

export async function Team(props: Props) {
  const { members, user, startup } = props

  const canManage = user?.address === startup.manager || isAdmin(user?.address)
  const canAllocate = user?.address === startup.allocator

  if (members.length === 0) {
    return null
  }
  // const canManage = false

  const [budgets, privyIdToken] = await Promise.all([
    getBudgetsWithGrants(startup.id),
    getPrivyIdToken(),
  ])

  return (
    <AgentChatProvider
      id={`startup-${startup.id}-${user?.address}`}
      type="flo"
      user={user}
      data={{ startupId: startup.id }}
      identityToken={privyIdToken}
    >
      <div className="container flex w-full p-0 max-sm:flex-col">
        <div className="flex w-full overflow-hidden">
          <SectionLabel label="Meet the team" />
          <ScrollArea className="pointer-events-auto mt-2 w-full whitespace-nowrap">
            <div className="flex space-x-4 pr-4">
              <AllocateBudgets
                isAllocator={canAllocate}
                isManager={canManage}
                flows={budgets}
                grants={budgets.map((b) => b.subgrants)}
                user={user?.address ?? null}
              >
                {members.map((m) => (
                  <TeamMemberCard
                    isAllocator={canManage}
                    key={m.recipient}
                    member={m}
                    currency={startup}
                  />
                ))}
              </AllocateBudgets>
              <div className="hidden sm:block">
                <OpportunitiesSection
                  canManage={canManage}
                  budgets={budgets}
                  startupId={startup.id}
                  user={user}
                />
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="flex w-full overflow-hidden sm:hidden">
          <SectionLabel label="Join the team" />
          <ScrollArea className="pointer-events-auto mt-2 w-full whitespace-nowrap">
            <div className="pr-4">
              <OpportunitiesSection
                canManage={canManage}
                budgets={budgets}
                startupId={startup.id}
                user={user}
              />
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </AgentChatProvider>
  )
}

async function OpportunitiesSection({
  canManage,
  budgets,
  startupId,
  user,
}: {
  canManage: boolean
  budgets: BudgetWithGrants[]
  startupId: string
  user: User | undefined
}) {
  const opportunitiesWithProfiles = await getOpportunitiesWithProfiles(startupId)
  return (
    <div className="flex space-x-4">
      {opportunitiesWithProfiles.map((o) => (
        <OpportunityCard
          key={o.id}
          id={o.id}
          title={o.position}
          applicationsCount={o._count.drafts}
          canManage={canManage}
          applications={o.applications}
          expectedMonthlySalary={o.expectedMonthlySalary}
          flowContract={o.flowId as `0x${string}`}
          user={user}
          startupId={startupId}
          chainId={o.budget.chainId}
          underlyingTokenSymbol={o.budget.underlyingTokenSymbol}
          underlyingTokenPrefix={o.budget.underlyingTokenPrefix}
        />
      ))}
      {canManage && (
        <CreateOpportunity
          budgets={budgets.map((b) => ({
            id: b.id,
            title: b.title,
            monthlyIncomingFlowRate: String(b.monthlyIncomingFlowRate),
          }))}
          startupId={startupId}
        />
      )}
      {canManage && <HireDirectly budgets={budgets} />}
    </div>
  )
}

async function getOpportunitiesWithProfiles(startupId: string) {
  const opportunities = await database.opportunity.findMany({
    select: {
      id: true,
      position: true,
      _count: { select: { drafts: { where: { isOnchain: false } } } },
      drafts: true,
      flowId: true,
      budget: {
        select: {
          chainId: true,
          underlyingTokenSymbol: true,
          underlyingTokenPrefix: true,
        },
      },
      expectedMonthlySalary: true,
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
      return {
        ...opportunity,
        applications: applicationsWithProfiles.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      }
    }),
  )
}

interface SectionLabelProps {
  label: string
  topClassName?: string
}

function SectionLabel({ label, topClassName = "top-3 md:top-4" }: SectionLabelProps) {
  return (
    <div className="relative h-full w-9 shrink-0">
      <div
        className={cn(
          "absolute left-4 z-10 origin-right -translate-x-full -rotate-90 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground",
          topClassName,
        )}
      >
        {label}
      </div>
    </div>
  )
}
