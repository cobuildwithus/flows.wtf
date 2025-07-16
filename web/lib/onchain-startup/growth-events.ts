"use server"

import { unstable_cache } from "next/cache"
import { getTokenPayments, type TokenPayment } from "./token-payments"
import { getHiringEvents, type HiringEvent } from "./hiring-events"
import { getAllStartupsWithIds } from "./startup"

export type GrowthEvent =
  | {
      type: "token-payment"
      data: TokenPayment & {
        flow: {
          name: string
          id: string
        }
      }
      timestamp: number
      address: string
    }
  | {
      type: "hiring"
      data: HiringEvent & {
        flow: {
          underlyingTokenSymbol?: string
          underlyingTokenPrefix?: string
          name: string
          id: string
        }
      }
      timestamp: number
      address: string
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
              flow: {
                name: startup.title,
                id: startup.slug,
              },
            },
            timestamp: payment.timestamp,
            address: payment.beneficiary,
          }),
        )
      }),
    ),
    (async () => {
      const hiringEvents = await getHiringEvents()
      return hiringEvents.map(
        (event): GrowthEvent => ({
          type: "hiring",
          data: {
            ...event,
            flow: {
              name: event.startupName,
              id: event.startupSlug,
              underlyingTokenSymbol: event.underlyingTokenSymbol,
              underlyingTokenPrefix: event.underlyingTokenPrefix,
            },
          },
          timestamp: event.hiredAt / 1000, // Convert to seconds
          address: event.recipient,
        }),
      )
    })(),
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
