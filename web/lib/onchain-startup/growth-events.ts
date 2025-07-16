"use server"

import { unstable_cache } from "next/cache"
import { getTokenPayments, type TokenPayment } from "./token-payments"
import { getHiringEvents, type HiringEvent } from "./hiring-events"
import { getAllStartupsWithIds } from "./startup"

// Define a unified growth event type
export type GrowthEvent =
  | {
      type: "token-payment"
      data: TokenPayment & {
        startup: {
          name: string
          slug: string
        }
      }
      timestamp: number
      address: string // beneficiary
    }
  | {
      type: "hiring"
      data: HiringEvent & {
        startup: {
          name: string
          slug: string
        }
      }
      timestamp: number
      address: string // recipient
    }

async function _getGrowthEvents() {
  const startups = getAllStartupsWithIds()

  // Fetch both token payments and hiring events for all startups
  const [allTokenPayments, allHiringEvents] = await Promise.all([
    // Fetch token payments
    Promise.all(
      startups.map(async (startup) => {
        const payments = await getTokenPayments(Number(startup.revnetProjectIds.base))
        return payments.map(
          (payment): GrowthEvent => ({
            type: "token-payment",
            data: {
              ...payment,
              startup: {
                name: startup.title,
                slug: startup.slug,
              },
            },
            timestamp: payment.timestamp,
            address: payment.beneficiary,
          }),
        )
      }),
    ),
    // Fetch hiring events
    Promise.all(
      startups.map(async (startup) => {
        const hiringEvents = await getHiringEvents(startup.id)
        return hiringEvents.map(
          (event): GrowthEvent => ({
            type: "hiring",
            data: {
              ...event,
              startup: {
                name: startup.title,
                slug: startup.slug,
              },
            },
            timestamp: event.hiredAt / 1000, // Convert to seconds
            address: event.recipient,
          }),
        )
      }),
    ),
  ])

  // Flatten and combine all events
  const allEvents = [...allTokenPayments.flat(), ...allHiringEvents.flat()]

  // Sort all events by timestamp (most recent first)
  return allEvents.sort((a, b) => b.timestamp - a.timestamp)
}

export const getGrowthEvents = unstable_cache(_getGrowthEvents, ["growth-events"], {
  revalidate: 60, // Cache for 60 seconds
  tags: ["growth-events"],
})
