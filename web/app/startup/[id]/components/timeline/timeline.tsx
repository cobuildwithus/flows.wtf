import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Startup } from "@/lib/onchain-startup/startup"
import { TeamMember } from "@/lib/onchain-startup/team-members"
import { getTokenPayments } from "@/lib/onchain-startup/token-payments"
import { Order } from "@/lib/shopify/orders"
import { MinimalCast } from "@/lib/types/cast"
import { cn } from "@/lib/utils"
import { CastEvent } from "./cast-event"
import { OrderEvent } from "./order-event"
import { TokenEvent } from "./token-event"
import { HiringEvent } from "./hiring-event"
import { TokenEventData } from "@/lib/onchain-startup/types"
import {
  getHiringEvents,
  type HiringEvent as HiringEventData,
} from "@/lib/onchain-startup/hiring-events"

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
  | {
      type: "hiring"
      date: Date
      data: HiringEventData
    }

const MAX_EVENTS = 50

export async function Timeline(props: Props) {
  const { orders, startup, teamMembers } = props

  const [tokenPayments, hiringEvents] = await Promise.all([
    startup.jbxProjectId
      ? getTokenPayments(Number(startup.jbxProjectId)).then((payments) => payments.slice(0, 30))
      : Promise.resolve([]),
    getHiringEvents(startup.id),
  ])

  const events: TimelineEvent[] = []

  orders.forEach((order) => {
    events.push({ type: "order", date: new Date(order.date), data: order })
  })

  tokenPayments.forEach((payment) => {
    if (!("timestamp" in payment) || typeof payment.timestamp !== "number") return
    events.push({ type: "token", date: new Date(payment.timestamp * 1000), data: payment })
  })

  hiringEvents.forEach((hiringEvent) => {
    events.push({
      type: "hiring",
      date: new Date(hiringEvent.hiredAt),
      data: hiringEvent,
    })
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
      case "hiring":
        return <HiringEvent hiringEvent={event.data} date={event.date} />
      default:
        return null
    }
  }

  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardContent className="space-y-6">
        <ScrollArea className="h-[430px] pr-4">
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
