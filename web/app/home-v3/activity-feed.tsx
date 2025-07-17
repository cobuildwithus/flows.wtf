import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { ActivityEvent } from "@/lib/home-v3/activity-feed-data"
import { OrderEvent } from "@/app/startup/[id]/components/timeline/order-event"
import { TokenEvent } from "@/app/startup/[id]/components/timeline/token-event"
import { HiringEventGlobal } from "./hiring-event-global"
import { TimelineIndicator } from "@/app/startup/[id]/components/timeline/timeline-indicator"

interface Props {
  events: ActivityEvent[]
}

export function ActivityFeed({ events }: Props) {
  return (
    <section className="py-16">
      <div className="container">
        <h2 className="mb-6 text-2xl font-semibold md:text-5xl">Builders and backers</h2>
        <p className="mb-6 text-muted-foreground">See who&apos;s building and backing projects</p>
        <Card className="border border-border/40 bg-card/80 shadow-sm">
          <CardContent className="space-y-6">
            <ScrollArea className="h-[650px] pr-4">
              <ul role="list" className="space-y-7">
                {events.map((event, i) => (
                  <li key={i} className="relative flex gap-x-4">
                    <div
                      className={cn(
                        i === events.length - 1 ? "h-6" : "-bottom-8",
                        "absolute left-0 top-0 flex w-6 justify-center",
                      )}
                    >
                      <div className="w-px bg-border" />
                    </div>
                    {renderEvent(event)}
                  </li>
                ))}
              </ul>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function renderEvent(event: ActivityEvent) {
  const date = typeof event.date === "string" ? new Date(event.date) : (event.date as Date)
  switch (event.type) {
    case "order":
      return <OrderEvent order={event.data} date={date} />
    case "token":
      return <TokenEvent payment={event.data} date={date} />
    case "hiring":
      return <HiringEventGlobal event={event.data} date={date} />
    default:
      return <TimelineIndicator />
  }
}
