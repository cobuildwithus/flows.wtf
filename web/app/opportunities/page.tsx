import database from "@/lib/database/flows-db"
import type { Metadata } from "next"
import { OpportunityItem } from "./components/opportunity-item"
import { AgentChatProvider } from "../chat/components/agent-chat"
import { getUser } from "@/lib/auth/user"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"

export const metadata: Metadata = {
  title: "Opportunities | Flows",
  description: "Find your next opportunity at projects in the Flows ecosystem.",
}

export default async function OpportunitiesPage() {
  const [opportunities, user, privyIdToken] = await Promise.all([
    getOpportunities(),
    getUser(),
    getPrivyIdToken(),
  ])

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-medium tracking-tight">Opportunities</h1>
          <p className="mt-2 text-muted-foreground">
            Discover exciting positions at projects in the Flows ecosystem.
          </p>
        </div>

        {opportunities.length === 0 ? (
          <p className="pt-12 text-center text-muted-foreground">
            Right now, there are no open positions.
          </p>
        ) : (
          <AgentChatProvider
            id={`startup-opportunities-${user?.address}`}
            type="flo"
            user={user}
            identityToken={privyIdToken}
          >
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <OpportunityItem key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </AgentChatProvider>
        )}
      </div>
    </div>
  )
}

async function getOpportunities() {
  return database.opportunity.findMany({
    where: { status: 1 },
    include: {
      startup: { select: { id: true, title: true, image: true, tagline: true } },
      _count: { select: { drafts: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}
