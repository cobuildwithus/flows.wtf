import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { farcasterDb } from "@/lib/database/farcaster-db"
import { Startup } from "@/lib/onchain-startup/startup"
import { TeamMember } from "@/lib/onchain-startup/team-members"
import { getTokenPayments } from "@/lib/onchain-startup/token-payments"
import { Order } from "@/lib/shopify/orders"
import { MinimalCast } from "@/lib/types/cast"
import { cn } from "@/lib/utils"
import { CastEvent } from "./cast-event"
import { OrderEvent } from "./order-event"
import { TokenEvent } from "./token-event"
import { TokenEventData } from "@/lib/onchain-startup/types"

interface Props {
  orders: Order[]
  startup: Startup
  teamMembers: TeamMember[]
}

type TimelineEvent =
  | { type: "order"; date: Date; data: Order }
  | { type: "cast"; date: Date; data: MinimalCast }
  | {
      type: "token"
      date: Date
      data: TokenEventData
    }

const MAX_EVENTS = 50

export async function Timeline(props: Props) {
  const { orders, startup, teamMembers } = props

  const [tokenPayments, casts] = await Promise.all([
    getTokenPayments(Number(startup.revnetProjectIds.base)).then((payments) =>
      payments.slice(0, 30),
    ),
    getTeamCasts(teamMembers.map((m) => m.fid).filter((fid) => fid !== undefined)),
  ])

  const events: TimelineEvent[] = []

  casts.forEach((cast) => {
    events.push({ type: "cast", date: new Date(cast.created_at), data: cast })
  })

  orders.forEach((order) => {
    events.push({ type: "order", date: new Date(order.date), data: order })
  })

  tokenPayments.forEach((payment) => {
    events.push({ type: "token", date: new Date(payment.timestamp * 1000), data: payment })
  })

  events.sort((a, b) => b.date.getTime() - a.date.getTime())

  const renderEventContent = (event: TimelineEvent) => {
    switch (event.type) {
      case "order":
        return <OrderEvent order={event.data} date={event.date} />
      case "cast":
        return <CastEvent cast={event.data} date={event.date} />
      case "token":
        return <TokenEvent payment={event.data} date={event.date} />
      default:
        return null
    }
  }

  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardContent className="space-y-6">
        <ScrollArea className="h-[630px] pr-4">
          <ul role="list" className="space-y-7">
            {events.slice(0, MAX_EVENTS).map((event, i) => (
              <li
                key={event.type + event.date.getMilliseconds() + i}
                className="relative flex gap-x-4"
              >
                <div
                  className={cn(
                    i === events.length - 1 ? "h-6" : "-bottom-8",
                    "absolute left-0 top-0 flex w-6 justify-center",
                  )}
                >
                  <div className="w-px bg-border" />
                </div>

                {renderEventContent(event)}
              </li>
            ))}
          </ul>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

const getTeamCasts = async (teamMemberFids: number[]) => {
  return farcasterDb.cast.findMany({
    select: {
      created_at: true,
      embeds: true,
      hash: true,
      id: true,
      impact_verifications: true,
      mentioned_fids: true,
      mentions_positions_array: true,
      text: true,
      profile: { select: { fname: true, display_name: true, avatar_url: true } },
    },
    where: {
      deleted_at: null,
      root_parent_url: "https://warpcast.com/~/channel/vrbscoffee",
      parent_hash: null,
      fid: { in: teamMemberFids },
    },
    orderBy: { created_at: "desc" },
    take: 30,
  })
}
