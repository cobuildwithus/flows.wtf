import database from "@/lib/database/flows-db"
import { base } from "viem/chains"
import type { Prisma } from "@prisma/flows"

type MockProject = {
  chainId: number
  projectId: number
  createdAt: number
  paymentsCount: number
  balance: string
  isRevnet: boolean
  deployer: string
  owner: string
  erc20: string | null
  erc20Supply: string
  erc20Name: string | null
  erc20Symbol: string | null
  cashoutA: string
  cashoutB: string
  currentRulesetId: string
  contributorsCount: number
  redeemCount: number
  redeemVolume: string
  pendingReservedTokens: string
  metadataUri: string | null
  metadata: unknown
  name: string | null
  infoUri: string | null
  logoUri: string | null
  coverImageUri: string | null
  twitter: string | null
  discord: string | null
  telegram: string | null
  tokens: string[]
  domain: string | null
  description: string | null
  tags: string[]
  projectTagline: string | null
  suckerGroupId: string | null
  accountingToken: string
  accountingDecimals: number
  accountingCurrency: string
  accountingTokenSymbol: string
  accountingTokenName: string
  activeRuleset: MockRuleset | null
}

type MockPayEvent = {
  id: string
  chainId: number
  projectId: number
  rulesetId: string
  rulesetCycleNumber: string
  txHash: string
  timestamp: number
  caller: string
  from: string
  logIndex: number
  payer: string
  beneficiary: string
  amount: string
  newlyIssuedTokenCount: string
  memo: string
  suckerGroupId: string | null
  txnValue: string
  metadata: string
  project: {
    erc20Symbol: string | null
  }
}

type MockRuleset = {
  rulesetId: string
  start: bigint
  duration: bigint
  weight: string
  metadata: string
}

type MockParticipant = {
  chainId: number
  projectId: number
  createdAt: number
  balance: string
  isRevnet: boolean
  address: string
  firstOwned: number | null
  cashOutValue: string
  suckerGroupId: string | null
}

type ProjectFindUniqueArgs = Prisma.JuiceboxProjectFindUniqueArgs
type PayEventFindManyArgs = Prisma.JuiceboxPayEventFindManyArgs
type ParticipantFindUniqueArgs = Prisma.JuiceboxParticipantFindUniqueArgs
type ParticipantFindManyArgs = Prisma.JuiceboxParticipantFindManyArgs

const now = Math.floor(Date.now() / 1000)

const BASE_ADDRESSES = {
  owner: "0x1111111111111111111111111111111111111111",
  deployer: "0x2222222222222222222222222222222222222222",
  accountingToken: "0x0000000000000000000000000000000000000000",
  payer: "0x3333333333333333333333333333333333333333",
  beneficiary: "0x4444444444444444444444444444444444444444",
  caller: "0x5555555555555555555555555555555555555555",
  from: "0x6666666666666666666666666666666666666666",
} as const

const PROJECT_OVERRIDES: Record<number, Partial<MockProject>> = {
  99: {
    name: "Flows",
    description:
      "An unstoppable growth engine for crowdfunding the onchain economy. Flows funds builders at flows.wtf",
    metadata: JSON.parse(
      '{"name":"Flows","description":"An unstoppable growth engine for crowdfunding the onchain economy. Flows funds builders at flows.wtf","logoUri":"ipfs://QmWzuj5XWACjZmUG8uyc5ZCf2DYSXU4kdi1PNvAdpfUcdn"}',
    ),
    metadataUri: "QmQMtWwyYx2eHzDzeoMLaKnZ6ksU786CJb7UPZmLp1BuP3",
    logoUri: "ipfs://QmWzuj5XWACjZmUG8uyc5ZCf2DYSXU4kdi1PNvAdpfUcdn",
    suckerGroupId: "851ba260f4d2fd35f0b42b9d5b1e9388",
    chainId: 8453,
    createdAt: 1751326269,
    paymentsCount: 634,
    balance: "584031683656757525",
    isRevnet: true,
    deployer: "0x027f1684c6d31066c3f2468117f2508e8134fdfc",
    owner: "0x027f1684c6d31066c3f2468117f2508e8134fdfc",
    erc20: "0xa66c1faefd257dbe9da50e56c7816b5710c9e2a1",
    erc20Supply: "55856113364874506679540",
    erc20Name: "Flows",
    erc20Symbol: "flows",
    cashoutA: "10033808190835",
    cashoutB: "7481913",
    currentRulesetId: "1751326269",
    contributorsCount: 0,
    redeemCount: 3,
    redeemVolume: "145158180554645283",
    pendingReservedTokens: "22014425390538646749",
    tokens: [],
    tags: [],
    projectTagline: null,
    infoUri: null,
    coverImageUri: null,
    twitter: null,
    discord: null,
    telegram: null,
    domain: null,
    accountingToken: "0x000000000000000000000000000000000000eeee",
    accountingDecimals: 18,
    accountingCurrency: "61166",
    accountingTokenSymbol: "ETH",
    accountingTokenName: "Ether",
  },
  104: {
    name: "Vrbs Coffee",
    description:
      "$CREMA is for those who believe the best things rise from real effort. It's a token of support for a coffee company built with care, fueled by purpose, and shared with a community that believes business can do good.\n\nvrbscoffee.com",
    metadata: JSON.parse(
      '{"name":"Vrbs Coffee","description":"$CREMA is for those who believe the best things rise from real effort. It\'s a token of support for a coffee company built with care, fueled by purpose, and shared with a community that believes business can do good. \\n\\nvrbscoffee.com","logoUri":"ipfs://Qme9q6r2EFDjwNsmaquEGBz6wAnxG1UbD4tgMSihtS8isp"}',
    ),
    metadataUri: "QmYeXvZ49praeQMWDzWKLHRCVc9jj9qBRSkKcqwpZMJawE",
    logoUri: "ipfs://Qme9q6r2EFDjwNsmaquEGBz6wAnxG1UbD4tgMSihtS8isp",
    suckerGroupId: "42cd8498743dc1a82c772521956742e8",
    chainId: 8453,
    createdAt: 1751416695,
    paymentsCount: 19,
    balance: "9280792400000000000000",
    isRevnet: true,
    deployer: "0x027f1684c6d31066c3f2468117f2508e8134fdfc",
    owner: "0x027f1684c6d31066c3f2468117f2508e8134fdfc",
    erc20: "0x6ad0e522157bf7702b49c62e953cd149bb690738",
    erc20Supply: "6739518882560000000000",
    erc20Name: "Vrbs Coffee",
    erc20Symbol: "CREMA",
    cashoutA: "950804338346402566",
    cashoutB: "5396597712607",
    currentRulesetId: "1751416695",
    contributorsCount: 18,
    redeemCount: 0,
    redeemVolume: "0",
    pendingReservedTokens: "2533422378240000000000",
    tokens: [],
    tags: [],
    projectTagline: null,
    infoUri: null,
    coverImageUri: null,
    twitter: null,
    discord: null,
    telegram: null,
    domain: null,
    accountingToken: "0xa66c1faefd257dbe9da50e56c7816b5710c9e2a1",
    accountingDecimals: 18,
    accountingCurrency: "281666209",
    accountingTokenSymbol: "flows",
    accountingTokenName: "Flows",
  },
  108: {
    name: "Stray Strong",
    description:
      "We turn recycled plastic into playful feeders that spark care on every corner.  Fueling a forever cycle of street art, animal love and return for the initiatives that support us.",
    metadata: JSON.parse(
      '{"name":"Stray Strong","description":"We turn recycled plastic into playful feeders that spark care on every corner.  Fueling a forever cycle of street art, animal love and return for the initiatives that support us.","logoUri":"ipfs://Qma7knXezhyuAPx9dcaCQG5QD5nawMNFX3TXgj7waA1vKu"}',
    ),
    metadataUri: "QmXTjYHpB1FPmg8vMCeuFPn6MmD79EWpGfUR854d214Xeu",
    logoUri: "ipfs://Qma7knXezhyuAPx9dcaCQG5QD5nawMNFX3TXgj7waA1vKu",
    suckerGroupId: "b2dab230b7c22c2dcbe4aea8228a7a1e",
    chainId: 8453,
    createdAt: 1752109379,
    paymentsCount: 3,
    balance: "984000000000000000000",
    isRevnet: true,
    deployer: "0x027f1684c6d31066c3f2468117f2508e8134fdfc",
    owner: "0x027f1684c6d31066c3f2468117f2508e8134fdfc",
    erc20: "0x74cc7c905610fbc61e8365ed031201de88ff962b",
    erc20Supply: "688800000000000000000",
    erc20Name: "Stray Strong",
    erc20Symbol: "FOUNS",
    cashoutA: "950000000000000000",
    cashoutB: "50813008130081",
    currentRulesetId: "1752109379",
    contributorsCount: 3,
    redeemCount: 0,
    redeemVolume: "0",
    pendingReservedTokens: "295200000000000000000",
    tokens: [],
    tags: [],
    projectTagline: null,
    infoUri: null,
    coverImageUri: null,
    twitter: null,
    discord: null,
    telegram: null,
    domain: null,
    accountingToken: "0xa66c1faefd257dbe9da50e56c7816b5710c9e2a1",
    accountingDecimals: 18,
    accountingCurrency: "281666209",
    accountingTokenSymbol: "flows",
    accountingTokenName: "Flows",
  },
  112: {
    name: "Tropicalbody",
    description:
      "We seek to encourage people to move, thus helping to combat chronic diseases caused by a sedentary lifestyle, improve mobility to reduce the number of falls and consequently the need for hospitals, and bring together the community.",
    metadata: JSON.parse(
      '{"name":"Tropicalbody","description":"We seek to encourage people to move, thus helping to combat chronic diseases caused by a sedentary lifestyle, improve mobility to reduce the number of falls and consequently the need for hospitals, and bring together the community.","logoUri":"ipfs://QmPy9opBfFcrL8qZyXY7DdmaYMXedUaNUjSbTVgJ76CsHZ"}',
    ),
    metadataUri: "QmfZ3CPu9xSCXJkMjsymPPWkAkNTYBd5YGChK8ucQq9TMF",
    logoUri: "ipfs://QmPy9opBfFcrL8qZyXY7DdmaYMXedUaNUjSbTVgJ76CsHZ",
    suckerGroupId: "6eae5a39b6a0ed419cea6046f416063c",
    chainId: 8453,
    createdAt: 1752532963,
    paymentsCount: 18,
    balance: "2002214265562000000000",
    isRevnet: true,
    deployer: "0x027f1684c6d31066c3f2468117f2508e8134fdfc",
    owner: "0x027f1684c6d31066c3f2468117f2508e8134fdfc",
    erc20: "0x38376c695acd751448c6425293f44cd55559fa29",
    erc20Supply: "1396202315910586777600",
    erc20Name: "Tropicalbody",
    erc20Symbol: "MOVE",
    cashoutA: "953638646366489700",
    cashoutB: "25164014550094",
    currentRulesetId: "1752532963",
    contributorsCount: 18,
    redeemCount: 0,
    redeemVolume: "0",
    pendingReservedTokens: "598372421104537190400",
    tokens: [],
    tags: [],
    projectTagline: null,
    infoUri: null,
    coverImageUri: null,
    twitter: null,
    discord: null,
    telegram: null,
    domain: null,
    accountingToken: "0xa66c1faefd257dbe9da50e56c7816b5710c9e2a1",
    accountingDecimals: 18,
    accountingCurrency: "281666209",
    accountingTokenSymbol: "flows",
    accountingTokenName: "Flows",
  },
}

const MOCK_PROJECTS: Record<number, MockProject> = Object.fromEntries(
  Object.entries(PROJECT_OVERRIDES).map(([id, overrides]) => {
    const projectId = Number(id)
    return [projectId, createMockProject(projectId, overrides)]
  }),
)

const MOCK_PAY_EVENTS: Record<number, MockPayEvent[]> = {
  99: createMockPayEvents(99, MOCK_PROJECTS[99]),
  104: createMockPayEvents(104, MOCK_PROJECTS[104]),
  108: createMockPayEvents(108, MOCK_PROJECTS[108]),
  112: createMockPayEvents(112, MOCK_PROJECTS[112]),
}

const MOCK_PARTICIPANTS: Record<number, MockParticipant[]> = {
  99: createMockParticipants(99, MOCK_PROJECTS[99]),
  104: createMockParticipants(104, MOCK_PROJECTS[104]),
  108: createMockParticipants(108, MOCK_PROJECTS[108]),
  112: createMockParticipants(112, MOCK_PROJECTS[112]),
}

const PROJECT_ID_BY_SUCKER_GROUP = Object.values(MOCK_PROJECTS).reduce((acc, project) => {
  if (project.suckerGroupId) acc.set(project.suckerGroupId, project.projectId)
  return acc
}, new Map<string, number>())

function createMockProject(projectId: number, overrides: Partial<MockProject>): MockProject {
  const weekInSeconds = 7n * 24n * 60n * 60n
  const createdAt = overrides.createdAt ?? now - 60 * 60 * 24 * 90
  const rulesetId = overrides.currentRulesetId ?? `${projectId}0001`
  const activeRulesetOverride = overrides.activeRuleset
  const activeRuleset: MockRuleset = {
    rulesetId,
    start: activeRulesetOverride?.start ?? BigInt(createdAt),
    duration: activeRulesetOverride?.duration ?? weekInSeconds,
    weight: activeRulesetOverride?.weight ?? (5n * 10n ** 17n).toString(),
    metadata: activeRulesetOverride?.metadata ?? "0",
  }

  return {
    chainId: overrides.chainId ?? base.id,
    projectId,
    createdAt,
    paymentsCount: overrides.paymentsCount ?? 0,
    balance: overrides.balance ?? "0",
    isRevnet: overrides.isRevnet ?? false,
    deployer: overrides.deployer ?? BASE_ADDRESSES.deployer,
    owner: overrides.owner ?? BASE_ADDRESSES.owner,
    erc20: overrides.erc20 ?? BASE_ADDRESSES.accountingToken,
    erc20Supply: overrides.erc20Supply ?? "0",
    erc20Name: overrides.erc20Name ?? `Project ${projectId} Token`,
    erc20Symbol: overrides.erc20Symbol ?? `PRJ${projectId}`,
    cashoutA: overrides.cashoutA ?? "0",
    cashoutB: overrides.cashoutB ?? "0",
    currentRulesetId: rulesetId,
    contributorsCount: overrides.contributorsCount ?? 0,
    redeemCount: overrides.redeemCount ?? 0,
    redeemVolume: overrides.redeemVolume ?? "0",
    pendingReservedTokens: overrides.pendingReservedTokens ?? "0",
    metadataUri: overrides.metadataUri ?? null,
    metadata: overrides.metadata ?? null,
    name: overrides.name ?? `Mock Project ${projectId}`,
    infoUri: overrides.infoUri ?? null,
    logoUri: overrides.logoUri ?? null,
    coverImageUri: overrides.coverImageUri ?? null,
    twitter: overrides.twitter ?? null,
    discord: overrides.discord ?? null,
    telegram: overrides.telegram ?? null,
    tokens: overrides.tokens ?? [],
    domain: overrides.domain ?? null,
    description: overrides.description ?? `Mock Juicebox data for project ${projectId}.`,
    tags: overrides.tags ?? [],
    projectTagline: overrides.projectTagline ?? null,
    suckerGroupId: overrides.suckerGroupId ?? `mock-sucker-${projectId}`,
    accountingToken: overrides.accountingToken ?? BASE_ADDRESSES.accountingToken,
    accountingDecimals: overrides.accountingDecimals ?? 18,
    accountingCurrency: overrides.accountingCurrency ?? "0",
    accountingTokenSymbol: overrides.accountingTokenSymbol ?? "MOCK",
    accountingTokenName: overrides.accountingTokenName ?? "Mock Token",
    activeRuleset,
  }
}

function createMockPayEvents(_projectId: number, _project: MockProject): MockPayEvent[] {
  // Token purchase history intentionally left empty; we don't mock individual payments.
  return []
}

function createMockParticipants(_projectId: number, _project: MockProject): MockParticipant[] {
  // Participant lists also remain empty; no synthetic holder balances.
  return []
}

function applySelect<T extends Record<string, any>>(record: T, select?: Record<string, any>) {
  if (!select) return { ...record }

  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(select)) {
    if (value === true) {
      result[key] = record[key as keyof T]
    } else if (value && typeof value === "object") {
      const nested = record[key as keyof T]
      if (!nested) continue

      const nestedSelect = (value as { select?: Record<string, any> }).select ?? value

      result[key] = applySelect(nested as Record<string, any>, nestedSelect)
    }
  }

  return result
}

function getMockProjectIdFromWhere(where?: Record<string, any>): number | undefined {
  if (!where) return undefined

  if ("projectId" in where && typeof where.projectId === "number") {
    return where.projectId
  }

  if (where.projectId?.equals && typeof where.projectId.equals === "number") {
    return where.projectId.equals
  }

  if (Array.isArray(where.projectId?.in)) {
    return where.projectId.in.find((value: unknown): value is number => typeof value === "number")
  }

  if ("chainId_projectId" in where) {
    return where.chainId_projectId?.projectId
  }

  if ("chainId_projectId_address" in where) {
    return where.chainId_projectId_address?.projectId
  }

  if ("suckerGroupId" in where && typeof where.suckerGroupId === "string") {
    return PROJECT_ID_BY_SUCKER_GROUP.get(where.suckerGroupId)
  }

  return undefined
}

function getChainIdFromWhere(where?: Record<string, any>): number | undefined {
  if (!where) return undefined

  if (typeof where.chainId === "number") return where.chainId

  if (where.chainId?.equals && typeof where.chainId.equals === "number") {
    return where.chainId.equals
  }

  if (where.chainId_projectId?.chainId) {
    return where.chainId_projectId.chainId
  }

  if (where.chainId_projectId_address?.chainId) {
    return where.chainId_projectId_address.chainId
  }

  return undefined
}

function isMockedProject(where?: Record<string, any>) {
  const projectId = getMockProjectIdFromWhere(where)
  if (!projectId) return false

  const chainId = getChainIdFromWhere(where)
  if (chainId && chainId !== base.id) return false

  return Boolean(MOCK_PROJECTS[projectId])
}

function filterPayEvents(events: MockPayEvent[], where?: Record<string, any>): MockPayEvent[] {
  if (!where) return events

  return events.filter((event) => {
    if (where.chainId && event.chainId !== where.chainId) return false
    if (where.projectId && event.projectId !== where.projectId) return false
    if (where.suckerGroupId && event.suckerGroupId !== where.suckerGroupId) return false

    if (where.timestamp?.gte && event.timestamp < where.timestamp.gte) return false
    if (where.timestamp?.lte && event.timestamp > where.timestamp.lte) return false

    if (where.newlyIssuedTokenCount?.gt) {
      if (
        BigInt(event.newlyIssuedTokenCount) <=
        BigInt(String(where.newlyIssuedTokenCount.gt))
      ) {
        return false
      }
    }

    return true
  })
}

function sortRecords<T>(records: T[], orderBy?: Record<string, "asc" | "desc">) {
  if (!orderBy) return records

  const [key, direction] = Object.entries(orderBy)[0] ?? []
  if (!key || !direction) return records

  const sorted = [...records]
  sorted.sort((a: any, b: any) => {
    if (a[key] === b[key]) return 0
    return direction === "asc" ? a[key] - b[key] : b[key] - a[key]
  })
  return sorted
}

function filterParticipants(participants: MockParticipant[], where?: Record<string, any>) {
  if (!where) return participants

  return participants.filter((participant) => {
    if (where.chainId && participant.chainId !== where.chainId) return false
    if (where.projectId && participant.projectId !== where.projectId) return false
    if (where.address && participant.address !== where.address) return false

    if (where.address?.in) {
      const target = participant.address.toLowerCase()
      const matches = where.address.in.some(
        (value: string) => value.toLowerCase() === target,
      )
      if (!matches) return false
    }

    if (where.address?.equals) {
      if (participant.address.toLowerCase() !== where.address.equals.toLowerCase()) return false
    }

    if (where.balance?.gt) {
      if (BigInt(participant.balance) <= BigInt(String(where.balance.gt))) return false
    }

    return true
  })
}

export const juiceboxDb = {
  juiceboxProject: {
    async findUnique(args: ProjectFindUniqueArgs) {
      const where = args?.where as Record<string, any> | undefined

      if (isMockedProject(where)) {
        const projectId = getMockProjectIdFromWhere(where)
        if (!projectId) return null
        const project = MOCK_PROJECTS[projectId]
        if (!project) return null
        return applySelect({ ...project }, args.select as Record<string, any> | undefined)
      }

      return database.juiceboxProject.findUnique(args)
    },
    async findUniqueOrThrow(args: ProjectFindUniqueArgs) {
      const result = await this.findUnique(args)
      if (!result) throw new Error("Mock Juicebox project not found")
      return result
    },
  },
  juiceboxPayEvent: {
    async findMany(args?: PayEventFindManyArgs) {
      const where = args?.where as Record<string, any> | undefined

      if (isMockedProject(where)) {
        const projectId = getMockProjectIdFromWhere(where)
        if (!projectId) return []
        const events = MOCK_PAY_EVENTS[projectId] ?? []
        const filtered = filterPayEvents(events, where)
        const sorted = sortRecords(
          filtered,
          args?.orderBy as Record<string, "asc" | "desc"> | undefined,
        )
        const select = args?.select as Record<string, any> | undefined
        return sorted.map((event) => applySelect({ ...event }, select))
      }

      return database.juiceboxPayEvent.findMany(args)
    },
  },
  juiceboxParticipant: {
    async findUnique(args: ParticipantFindUniqueArgs) {
      const where = args?.where as Record<string, any> | undefined

      if (isMockedProject(where)) {
        const projectId = getMockProjectIdFromWhere(where)
        if (!projectId) return null
        const participants = MOCK_PARTICIPANTS[projectId] ?? []

        const address =
          (where?.chainId_projectId_address?.address ??
            where?.address ??
            where?.address?.equals) as string | undefined

        if (!address) return null

        const participant = participants.find(
          (p) => p.address.toLowerCase() === String(address).toLowerCase(),
        )

        if (!participant) return null

        return applySelect({ ...participant }, args.select as Record<string, any> | undefined)
      }

      return database.juiceboxParticipant.findUnique(args)
    },
    async findMany(args?: ParticipantFindManyArgs) {
      const where = args?.where as Record<string, any> | undefined

      if (isMockedProject(where)) {
        const projectId = getMockProjectIdFromWhere(where)
        if (!projectId) return []
        const participants = MOCK_PARTICIPANTS[projectId] ?? []
        const filtered = filterParticipants(participants, where)
        const select = args?.select as Record<string, any> | undefined
        return filtered.map((participant) => applySelect({ ...participant }, select))
      }

      return database.juiceboxParticipant.findMany(args)
    },
  },
}

export type MockJuiceboxDb = typeof juiceboxDb
