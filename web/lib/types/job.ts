export type EmbeddingType = (typeof validTypes)[number]

export interface JobBody {
  type: EmbeddingType
  content: string
  groups: string[]
  users: string[]
  tags: string[]
  externalId: string
  hashSuffix?: string
  urls?: string[]
}

export const validTypes = [
  "grant",
  "cast",
  "grant-application",
  "flow",
  "dispute",
  "draft-application",
  "builder-profile",
  "story",
] as const

export enum EmbeddingTag {
  Flows = "flows",
  Drafts = "drafts",
  Grants = "grants",
}

export const validTags = [EmbeddingTag.Flows, EmbeddingTag.Drafts, EmbeddingTag.Grants] as const

export interface IsGrantUpdateJobBody {
  castContent: string
  grantDescription: string
  parentFlowDescription: string
  castHash: string
  grantId: string
  urls: string[]
}

export interface BuilderProfileJobBody {
  fid: string
}
