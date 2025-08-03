"use server"

import database from "@/lib/database/flows-db"
import { getAllStartupsWithIds } from "./startup"
import { base } from "viem/chains"
import { PAYMENT_GATEWAY_ADDRESS } from "../config"
import { startupsToJbxBaseProjectId } from "@/addresses"

export interface TopContributor {
  address: string
  totalAmount: string
  paymentCount: number
  firstPayment: number | null
  startups: Array<{
    name: string
    id: string
    slug: string
    amount: string
    paymentCount: number
    image: string
  }>
}

export interface TopContributorsData {
  weekly: TopContributor[]
  allTime: TopContributor[]
}

export async function getTopContributorsForAllStartups(): Promise<TopContributorsData> {
  const startups = getAllStartupsWithIds()

  // Get current timestamp and one week ago
  const now = Math.floor(Date.now() / 1000)
  const oneWeekAgo = now - 7 * 24 * 60 * 60

  // Get all pay events for all startups
  const allPayEventsPromises = startups.map(async (startup) => {
    const jbxProjectId =
      startupsToJbxBaseProjectId[startup.id as keyof typeof startupsToJbxBaseProjectId]
    if (!jbxProjectId) {
      return {
        startup,
        weeklyEvents: [],
        allTimeEvents: [],
      }
    }

    const [weeklyEvents, allTimeEvents] = await Promise.all([
      // Weekly events
      database.juiceboxPayEvent.findMany({
        where: {
          chainId: base.id,
          projectId: jbxProjectId,
          timestamp: {
            gte: oneWeekAgo,
          },
        },
        select: {
          beneficiary: true,
          amount: true,
          timestamp: true,
          txnValue: true,
        },
      }),
      // All time events
      database.juiceboxPayEvent.findMany({
        where: {
          chainId: base.id,
          projectId: jbxProjectId,
        },
        select: {
          beneficiary: true,
          amount: true,
          timestamp: true,
          txnValue: true,
        },
      }),
    ])

    return {
      startup,
      weeklyEvents,
      allTimeEvents,
    }
  })

  const allStartupEvents = await Promise.all(allPayEventsPromises)

  // Process events and group by beneficiary
  const weeklyContributors = processEventsByBeneficiary(
    allStartupEvents.map((s) => ({ ...s, events: s.weeklyEvents })),
  )

  const allTimeContributors = processEventsByBeneficiary(
    allStartupEvents.map((s) => ({ ...s, events: s.allTimeEvents })),
  )

  return {
    weekly: weeklyContributors.slice(0, 20).filter((c) => c.address !== PAYMENT_GATEWAY_ADDRESS),
    allTime: allTimeContributors.slice(0, 20).filter((c) => c.address !== PAYMENT_GATEWAY_ADDRESS),
  }
}

function processEventsByBeneficiary(
  startupsWithEvents: Array<{
    startup: { title: string; id: string; slug: string; image: string }
    events: Array<{ beneficiary: string; amount: any; timestamp: number; txnValue: any }>
  }>,
): TopContributor[] {
  const beneficiaryMap = new Map<
    string,
    {
      totalAmount: bigint
      paymentCount: number
      firstPayment: number
      startups: Map<
        string,
        {
          name: string
          id: string
          slug: string
          amount: bigint
          paymentCount: number
          image: string
        }
      >
    }
  >()

  // Process all events across all startups
  startupsWithEvents.forEach(({ startup, events }) => {
    events.forEach((event) => {
      // Use txnValue instead of amount for contribution value
      const txnValueStr = event.txnValue.toString()
      let amount: bigint

      try {
        // If it's in scientific notation, convert to regular number first
        if (txnValueStr.includes("e") || txnValueStr.includes("E")) {
          const num = Number(txnValueStr)
          amount = BigInt(Math.floor(num))
        } else {
          // Remove any decimal places and convert
          const cleanAmount = txnValueStr.split(".")[0]
          amount = BigInt(cleanAmount)
        }
      } catch (error) {
        console.warn("Failed to convert txnValue to BigInt:", txnValueStr, error)
        amount = BigInt(0)
      }

      const existing = beneficiaryMap.get(event.beneficiary)

      if (existing) {
        existing.totalAmount += amount
        existing.paymentCount += 1
        existing.firstPayment = Math.min(existing.firstPayment, event.timestamp)

        const existingStartup = existing.startups.get(startup.id)
        if (existingStartup) {
          existingStartup.amount += amount
          existingStartup.paymentCount += 1
        } else {
          existing.startups.set(startup.id, {
            name: startup.title,
            id: startup.id,
            slug: startup.slug,
            amount,
            paymentCount: 1,
            image: startup.image,
          })
        }
      } else {
        const startupsMap = new Map()
        startupsMap.set(startup.id, {
          name: startup.title,
          id: startup.id,
          slug: startup.slug,
          amount,
          paymentCount: 1,
          image: startup.image,
        })

        beneficiaryMap.set(event.beneficiary, {
          totalAmount: amount,
          paymentCount: 1,
          firstPayment: event.timestamp,
          startups: startupsMap,
        })
      }
    })
  })

  // Convert to array and sort by total amount
  return Array.from(beneficiaryMap.entries())
    .map(([address, data]): TopContributor => {
      const totalAmountStr = data.totalAmount.toString()
      console.log("Final contributor data:", address, "totalAmount:", totalAmountStr)

      return {
        address,
        totalAmount: totalAmountStr,
        paymentCount: data.paymentCount,
        firstPayment: data.firstPayment,
        startups: Array.from(data.startups.values()).map((startup) => ({
          ...startup,
          amount: startup.amount.toString(),
        })),
      }
    })
    .sort((a, b) => Number(BigInt(b.totalAmount) - BigInt(a.totalAmount)))
}

// export const getTopContributorsForAllStartups = unstable_cache(
//   _getTopContributorsForAllStartups,
//   ["top-contributors-all-startups-v2"],
//   {
//     revalidate: 300, // Cache for 5 minutes
//     tags: ["top-contributors-v2"],
//   },
// )
