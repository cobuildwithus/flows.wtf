import { DateTime } from "@/components/ui/date-time"
import { Order } from "@/lib/shopify/orders"
import pluralize from "pluralize"
import { TimelineIndicator } from "./timeline-indicator"

interface Props {
  order: Order
  date: Date
}

export async function OrderEvent({ order, date }: Props) {
  return (
    <>
      <TimelineIndicator />
      <div className="flex w-full items-center justify-between">
        <p className="text-sm text-muted-foreground">
          New order from <span className="font-medium text-foreground"> {order.country}</span> -{" "}
          {pluralize("item", order.itemsCount, true)} for ${parseFloat(order.amount).toFixed(2)}
        </p>
        <DateTime date={date} relative short className="text-xs text-muted-foreground" />
      </div>
    </>
  )
}
