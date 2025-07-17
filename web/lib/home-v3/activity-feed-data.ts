"use server"

import { getAllStartupsWithIds } from "@/lib/onchain-startup/startup"
import { getTokenPayments } from "@/lib/onchain-startup/token-payments"
import { getHiringEvents } from "@/lib/onchain-startup/hiring-events"
import { getAllOrders } from "@/lib/shopify/orders"
import type { Order } from "@/lib/shopify/orders"
import type { TokenEventData } from "@/lib/onchain-startup/types"
import type { HiringEvent } from "@/lib/onchain-startup/hiring-events"
import { unstable_cache } from "next/cache"

export type ActivityEvent =
  | { type: "order"; date: Date; data: Order }
  | { type: "token"; date: Date; data: TokenEventData }
  | { type: "hiring"; date: Date; data: HiringEvent }

const MAX_EVENTS = 100

async function _getActivityFeedEvents(): Promise<ActivityEvent[]> {
  const startups = getAllStartupsWithIds()

  const ordersPromises = startups.map(async (s) => {
    if (!s.shopify) return [] as Order[]
    const orders = await getAllOrders(s.shopify)
    return orders.slice(0, 20) // limit per startup
  })

  const tokenPromises = startups.map(async (s) => {
    const payments = await getTokenPayments(Number(s.revnetProjectIds.base))
    return payments.slice(0, 20)
  })

  const [ordersNested, tokenNested, hiringEvents] = await Promise.all([
    Promise.all(ordersPromises),
    Promise.all(tokenPromises),
    getHiringEvents(),
  ])

  const events: ActivityEvent[] = []

  ordersNested.flat().forEach((order) => {
    events.push({ type: "order", date: new Date(order.date), data: order })
  })

  tokenNested.flat().forEach((payment) => {
    events.push({ type: "token", date: new Date(payment.timestamp * 1000), data: payment })
  })

  hiringEvents.forEach((h) => {
    events.push({ type: "hiring", date: new Date(h.hiredAt), data: h })
  })

  // sort by date desc
  events.sort((a, b) => b.date.getTime() - a.date.getTime())

  return events.slice(0, MAX_EVENTS)
}

export const getActivityFeedEvents = unstable_cache(_getActivityFeedEvents, ["activity-feed"], {
  tags: ["activity-feed"],
  revalidate: 60,
})
