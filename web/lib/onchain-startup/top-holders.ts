"use server"

import { unstable_cache } from "next/cache"
import database from "@/lib/database/flows-db"
import { getAllStartupsWithIds } from "./startup"
import { base } from "viem/chains"

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
  }>
}

export interface TopContributorsData {
  weekly: TopContributor[]
  allTime: TopContributor[]
}

async function _getTopContributorsForAllStartups(): Promise<TopContributorsData> {
  const startups = getAllStartupsWithIds()

  // Get current timestamp and one week ago
  const now = Math.floor(Date.now() / 1000)
  const oneWeekAgo = now - 7 * 24 * 60 * 60

  // Get all pay events for all startups
  const allPayEventsPromises = startups.map(async (startup) => {
    const [weeklyEvents, allTimeEvents] = await Promise.all([
      // Weekly events
      database.juiceboxPayEvent.findMany({
        where: {
          chainId: base.id,
          projectId: Number(startup.revnetProjectIds.base),
          timestamp: {
            gte: oneWeekAgo,
          },
        },
        select: {
          beneficiary: true, // Changed from payer to beneficiary
          amount: true,
          timestamp: true,
        },
      }),
      // All time events
      database.juiceboxPayEvent.findMany({
        where: {
          chainId: base.id,
          projectId: Number(startup.revnetProjectIds.base),
        },
        select: {
          beneficiary: true, // Changed from payer to beneficiary
          amount: true,
          timestamp: true,
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
    weekly: weeklyContributors.slice(0, 20),
    allTime: allTimeContributors.slice(0, 20),
  }
}

function processEventsByBeneficiary(
  startupsWithEvents: Array<{
    startup: { title: string; id: string; slug: string }
    events: Array<{ beneficiary: string; amount: any; timestamp: number }>
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
        }
      >
    }
  >()

  // Process all events across all startups
  startupsWithEvents.forEach(({ startup, events }) => {
    events.forEach((event) => {
      // Fix BigInt conversion - handle scientific notation
      const amountStr = event.amount.toString()
      console.log("Processing amount:", amountStr, typeof event.amount)
      let amount: bigint

      try {
        // If it's in scientific notation, convert to regular number first
        if (amountStr.includes("e") || amountStr.includes("E")) {
          const num = Number(amountStr)
          amount = BigInt(Math.floor(num))
          console.log(
            "Converted scientific notation:",
            amountStr,
            "->",
            num,
            "->",
            amount.toString(),
          )
        } else {
          // Remove any decimal places and convert
          const cleanAmount = amountStr.split(".")[0]
          amount = BigInt(cleanAmount)
          console.log(
            "Converted regular amount:",
            amountStr,
            "->",
            cleanAmount,
            "->",
            amount.toString(),
          )
        }
      } catch (error) {
        console.warn("Failed to convert amount to BigInt:", amountStr, error)
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

export const getTopContributorsForAllStartups = unstable_cache(
  _getTopContributorsForAllStartups,
  ["top-contributors-all-startups"],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ["top-contributors"],
  },
)

// Get top contributors for a specific startup
async function _getTopContributorsForStartup(startupId: string): Promise<TopContributorsData> {
  const startups = getAllStartupsWithIds()
  const startup = startups.find((s) => s.id === startupId)

  if (!startup) {
    throw new Error(`Startup not found: ${startupId}`)
  }

  const now = Math.floor(Date.now() / 1000)
  const oneWeekAgo = now - 7 * 24 * 60 * 60

  const [weeklyEvents, allTimeEvents] = await Promise.all([
    database.juiceboxPayEvent.findMany({
      where: {
        chainId: base.id,
        projectId: Number(startup.revnetProjectIds.base),
        timestamp: {
          gte: oneWeekAgo,
        },
      },
      select: {
        beneficiary: true,
        amount: true,
        timestamp: true,
      },
    }),
    database.juiceboxPayEvent.findMany({
      where: {
        chainId: base.id,
        projectId: Number(startup.revnetProjectIds.base),
      },
      select: {
        beneficiary: true,
        amount: true,
        timestamp: true,
      },
    }),
  ])

  const weeklyContributors = processEventsByBeneficiary([{ startup, events: weeklyEvents }]).slice(
    0,
    20,
  )

  const allTimeContributors = processEventsByBeneficiary([
    { startup, events: allTimeEvents },
  ]).slice(0, 20)

  return {
    weekly: weeklyContributors,
    allTime: allTimeContributors,
  }
}

export const getTopContributorsForStartup = unstable_cache(
  _getTopContributorsForStartup,
  ["top-contributors-startup"],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ["top-contributors"],
  },
)
