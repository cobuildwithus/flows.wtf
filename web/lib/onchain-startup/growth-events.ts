"use server"

import { unstable_cache } from "next/cache"
import { getTokenPayments, type TokenPayment } from "./token-payments"
import { getHiringEvents, type HiringEvent } from "./hiring-events"
import { getAllStartupsWithIds } from "./startup"
import { getUserProfile, type Profile } from "@/components/user-profile/get-user-profile"
import { Address } from "viem"

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
      profile: Profile
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
      profile: Profile
    }

async function _getGrowthEvents(): Promise<GrowthEvent[]> {
  const startups = getAllStartupsWithIds()

  // Fetch both token payments and hiring events for all startups
  const [allTokenPayments, allHiringEvents] = await Promise.all([
    // Fetch token payments
    Promise.all(
      startups.map(async (startup) => {
        const payments = await getTokenPayments(Number(startup.revnetProjectId))
        return payments.map(
          (payment): Omit<GrowthEvent, "profile"> => ({
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
        (event): Omit<GrowthEvent, "profile"> => ({
          type: "hiring",
          data: {
            ...event,
            flow: {
              name: event.startupName,
              id: event.flowId,
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

  // Sort all events by timestamp (most recent first) and limit to 20
  const sortedEvents = allEvents.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20)

  // Get unique addresses to fetch profiles efficiently
  const uniqueAddresses = [...new Set(sortedEvents.map((event) => event.address))]

  // Fetch all profiles in parallel
  const profiles = await Promise.all(
    uniqueAddresses.map((address) => getUserProfile(address as Address)),
  )

  // Create a map for quick profile lookup
  const profileMap = new Map(uniqueAddresses.map((address, index) => [address, profiles[index]]))

  // Add profiles to events
  return sortedEvents.map(
    (event) =>
      ({
        ...event,
        profile: profileMap.get(event.address)!,
      }) as GrowthEvent,
  )
}

export const getGrowthEvents = unstable_cache(_getGrowthEvents, ["growth-events"], {
  revalidate: 60, // Cache for 60 seconds
  tags: ["growth-events"],
})
