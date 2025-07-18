"use server"

import { unstable_cache } from "next/cache"
import database from "@/lib/database/flows-db"
import { getAllStartupsWithIds, getStartupData } from "./startup"
import { Grant } from "../database/types"
import { customFlows } from "@/app/(custom-flow)/custom-flows"

function getCustomFlowById(flowId: string) {
  return customFlows.find((a) => a.flowId === flowId)
}

async function _getHiringEvents(id?: string) {
  if (!id) {
    return getAllHiringEvents()
  }

  return getHiringEventsForStartup(id)
}

async function getAllHiringEvents() {
  const [flows, budgets] = await Promise.all([
    database.grant.findMany({
      where: { isFlow: true, isActive: true },
      select: {
        isOnchainStartup: true,
        id: true,
        title: true,
        parentContract: true,
        manager: true,
      },
    }),
    database.grant.findMany({
      where: { isFlow: true, isActive: true },
      include: {
        subgrants: { where: { isActive: true, isFlow: false, isSiblingFlow: false } },
      },
    }),
  ])

  return budgets.flatMap((budget) => {
    const { startupName, startupSlug } = getStartupInfo(budget, flows)

    return budget.subgrants
      .filter((subgrant) => subgrant.recipient !== budget.manager)
      .map((subgrant) => ({
        recipient: subgrant.recipient,
        hiredAt: (subgrant.activatedAt || subgrant.createdAt) * 1000,
        monthlyFlowRate: subgrant.monthlyIncomingFlowRate,
        startupName,
        startupSlug,
        isOnchainStartup: budget.isOnchainStartup,
        underlyingTokenSymbol: budget.underlyingTokenSymbol,
        underlyingTokenPrefix: budget.underlyingTokenPrefix,
      }))
  })
}

async function getHiringEventsForStartup(id: string) {
  const mainFlow = await database.grant.findFirstOrThrow({
    select: { manager: true, parentContract: true, rootContract: true },
    where: { id, isFlow: true, isActive: true },
    orderBy: { createdAt: "asc" },
  })

  const budgets = await database.grant.findMany({
    omit: { description: true },
    where: {
      manager: mainFlow.manager,
      isFlow: true,
      isActive: true,
      rootContract: mainFlow.rootContract,
      parentContract: { not: mainFlow.rootContract },
    },
    orderBy: { createdAt: "asc" },
    include: {
      subgrants: {
        where: { isActive: true, isFlow: false, isSiblingFlow: false },
        select: {
          recipient: true,
          monthlyIncomingFlowRate: true,
          activatedAt: true,
          createdAt: true,
        },
      },
    },
  })

  return budgets.flatMap((budget) => {
    const { startupName, startupSlug } = getStartupInfoForBudget(budget)

    return budget.subgrants
      .filter((subgrant) => subgrant.recipient !== mainFlow.manager)
      .map((subgrant) => ({
        recipient: subgrant.recipient,
        hiredAt: (subgrant.activatedAt || subgrant.createdAt) * 1000,
        monthlyFlowRate: subgrant.monthlyIncomingFlowRate,
        startupName,
        startupSlug,
        isOnchainStartup: budget.isOnchainStartup,
        underlyingTokenSymbol: budget.underlyingTokenSymbol,
        underlyingTokenPrefix: budget.underlyingTokenPrefix,
      }))
  })
}

type LimitedFlow = Pick<Grant, "id" | "title" | "parentContract" | "isOnchainStartup" | "manager">

function getStartupInfo(budget: Grant, flows: LimitedFlow[]) {
  const startupsById = Object.fromEntries(
    getAllStartupsWithIds().map((startup) => [startup.id, startup]),
  )
  let startupName = budget.title
  let startupSlug = budget.id

  // Check if the budget is a custom flow
  const budgetCustomFlow = getCustomFlowById(budget.id)
  if (budgetCustomFlow) {
    startupSlug = budgetCustomFlow.id
  }

  // Check if there's a parent flow
  const parentFlow = flows.find((flow) => flow.id === budget.parentContract)
  if (parentFlow) {
    startupName = parentFlow.title
    startupSlug = parentFlow.id

    // Check if the parent flow is a custom flow
    const parentCustomFlow = getCustomFlowById(parentFlow.id)
    if (parentCustomFlow) {
      startupSlug = parentCustomFlow.id
    }
  }

  // Check if there's startup data available
  const possibleStartupId = flows.find(
    (flow) => flow.manager === budget.manager && flow.isOnchainStartup,
  )
  const startupData =
    (possibleStartupId && startupsById[possibleStartupId.id]) || startupsById[budget.id]
  if (startupData) {
    startupName = startupData.title
    startupSlug = startupData.slug
  }

  return { startupName, startupSlug }
}

function getStartupInfoForBudget(budget: LimitedFlow) {
  let startupName = budget.title
  let startupSlug = budget.id

  // Check if the budget is a custom flow
  const customFlow = getCustomFlowById(budget.id)
  if (customFlow) {
    startupSlug = customFlow.id
    return { startupName, startupSlug }
  }

  if (budget.isOnchainStartup) {
    try {
      const startupData = getStartupData(budget.id)
      startupName = startupData.title
      startupSlug = startupData.slug
    } catch {
      // Fallback to budget data if startup not found
    }
  }

  return { startupName, startupSlug }
}

export type HiringEvent = Awaited<ReturnType<typeof _getHiringEvents>>[0]

export const getHiringEvents = unstable_cache(_getHiringEvents, ["hiring-events"], {
  tags: ["hiring-events-v2"],
  revalidate: 15 * 60, // 15 minutes
})
