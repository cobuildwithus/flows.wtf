import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { getActivityFeedEvents, ActivityEvent } from "@/lib/homepage/activity-feed-data"
import { OrderEvent } from "@/app/startup/[id]/components/timeline/order-event"
import { TokenEvent } from "@/app/startup/[id]/components/timeline/token-event"
import { HiringEventGlobal } from "./hiring-event-global"
import { TimelineIndicator } from "@/app/startup/[id]/components/timeline/timeline-indicator"

export default async function ActivityFeed() {
  const events = await getActivityFeedEvents()

  return (
    <div>
      <ScrollArea className="h-[650px]">
        <div className="space-y-6 pr-4">
          {events.slice(0, 10).map((event, i) => (
            <div key={i} className="relative flex gap-4 md:hidden">
              <div
                className={cn(
                  "absolute left-0 top-0 flex w-6 justify-center",
                  i === Math.min(events.length, 10) - 1 ? "h-6" : "-bottom-6",
                )}
              >
                <div className="w-px bg-border/50" />
              </div>
              {renderEvent(event)}
            </div>
          ))}
          {events.map((event, i) => (
            <div key={i} className="relative hidden gap-4 md:flex">
              <div
                className={cn(
                  "absolute left-0 top-0 flex w-6 justify-center",
                  i === events.length - 1 ? "h-6" : "-bottom-6",
                )}
              >
                <div className="w-px bg-border/50" />
              </div>
              {renderEvent(event)}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
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
