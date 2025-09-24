"use server"

import database from "@/lib/database/flows-db"
import { Grant } from "../database/types"
import { customFlows } from "@/app/(custom-flow)/custom-flows"

/* ---------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------*/

/**
 * Returns the custom flow slug (if any) for a given flow id.
 */
function getCustomFlowSlug(flowId: string): string | undefined {
  return customFlows.find((flow) => flow.flowId === flowId)?.id
}

type LimitedFlow = Pick<Grant, "id" | "title" | "parentContract" | "isOnchainStartup" | "manager">

/**
 * Derives display information (name + slug) for a given budget / flow.
 *
 * The logic prefers, in order:
 * 1. Custom flow override
 * 2. Parent flow info (and its custom flow override)
 * 3. On-chain startup metadata
 * 4. Fallback to the budget itself
 */
function getStartupInfo(
  budget: LimitedFlow,
  allFlows: LimitedFlow[] = [],
): { startupName: string; url: string } {
  // 1. Start with the budget itself (plus potential custom flow override)
  let startupName = budget.title
  let startupSlug = getCustomFlowSlug(budget.id) || ""

  // 2. Prefer the parent flow if present
  const parentFlow = allFlows.find((flow) => flow.id === budget.parentContract)
  if (parentFlow) {
    startupName = parentFlow.title
    startupSlug = getCustomFlowSlug(parentFlow.id) || ""
  }

  // 3. Use on-chain startup metadata when available
  const possibleStartupFlow = budget.isOnchainStartup
    ? budget
    : allFlows.find((flow) => flow.manager === budget.manager && flow.isOnchainStartup)

  if (possibleStartupFlow) {
    startupName = possibleStartupFlow.title
    startupSlug = getCustomFlowSlug(possibleStartupFlow.id) || ""
  }

  const url = startupSlug ? `/${startupSlug}` : `/flow/${budget.id}`

  return { startupName, url }
}

export type HiringEvent = {
  recipient: string
  hiredAt: number
  monthlyFlowRate: string | bigint
  startupName: string
  url: string
  flowId: string
  isOnchainStartup: boolean
  underlyingTokenSymbol: string
  underlyingTokenPrefix: string
}

/**
 * Converts a subgrant row into a normalized HiringEvent object.
 * Returns `null` when the subgrant should be ignored (e.g. payments to the manager).
 */
function subgrantToHiringEvent(
  budget: Grant,
  subgrant: {
    recipient: string
    monthlyIncomingFlowRate: string
    activatedAt: number | null
    createdAt: number
  },
  startup: { startupName: string; url: string },
  mainManager?: string,
) {
  if (subgrant.recipient === (mainManager ?? budget.manager)) return null

  return {
    recipient: subgrant.recipient,
    hiredAt: (subgrant.activatedAt ?? subgrant.createdAt) * 1000,
    monthlyFlowRate: subgrant.monthlyIncomingFlowRate,
    startupName: startup.startupName,
    url: startup.url,
    flowId: budget.id,
    isOnchainStartup: budget.isOnchainStartup,
    underlyingTokenSymbol: budget.underlyingTokenSymbol,
    underlyingTokenPrefix: budget.underlyingTokenPrefix,
  }
}

/* ---------------------------------------------------------------------
 * Public API
 * -------------------------------------------------------------------*/

/**
 * Fetches hiring events.
 * When `id` is provided, only events for that startup are returned.
 */
export async function getHiringEvents(id?: string): Promise<HiringEvent[]> {
  return id ? getHiringEventsForStartup(id) : getAllHiringEvents()
}

/* ---------------------------------------------------------------------
 * Internals
 * -------------------------------------------------------------------*/

async function getAllHiringEvents(): Promise<HiringEvent[]> {
  const [flows, budgets] = await Promise.all([
    database.grant.findMany({
      where: {
        isFlow: true,
        isActive: true,
        rootContract: { not: "0xa5c54bd551648aa6e275f79787c42a238e519578" },
      },
      select: {
        isOnchainStartup: true,
        id: true,
        title: true,
        parentContract: true,
        manager: true,
      },
    }),
    database.grant.findMany({
      where: {
        isFlow: true,
        isActive: true,
        rootContract: { not: "0xa5c54bd551648aa6e275f79787c42a238e519578" },
      },
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
    }),
  ])

  return budgets.flatMap((budget) => {
    const startup = getStartupInfo(budget, flows)
    return (
      budget.subgrants
        .map((subgrant) =>
          subgrantToHiringEvent(
            budget,
            { ...subgrant, monthlyIncomingFlowRate: subgrant.monthlyIncomingFlowRate.toString() },
            startup,
          ),
        )
        // Filter out subgrants that were skipped (manager payments)
        .filter(Boolean)
    )
  }) as HiringEvent[]
}

async function getHiringEventsForStartup(id: string): Promise<HiringEvent[]> {
  const mainFlow = await database.grant.findFirstOrThrow({
    select: { manager: true, rootContract: true },
    where: { id, isFlow: true, isActive: true },
  })

  const budgets = await database.grant.findMany({
    // description retained for type compatibility
    where: {
      manager: mainFlow.manager,
      isFlow: true,
      isActive: true,
      rootContract: mainFlow.rootContract,
      parentContract: { not: mainFlow.rootContract },
    },
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
    const startup = getStartupInfo(budget)
    return budget.subgrants
      .map((subgrant) =>
        subgrantToHiringEvent(
          budget,
          { ...subgrant, monthlyIncomingFlowRate: subgrant.monthlyIncomingFlowRate.toString() },
          startup,
          mainFlow.manager,
        ),
      )
      .filter(Boolean)
  }) as HiringEvent[]
}
