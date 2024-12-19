import { validTypes } from "../types/job"

export type Embedding = {
  id: string
  created_at: Date
  updated_at: Date
  type: (typeof validTypes)[number]
  version: number
  content: string
  content_hash: string
  embedding: number[]
  groups: string[]
  users: string[]
  tags: string[]
  external_id: string
  urls: string[]
  url_summaries: string[]
  raw_content: string
  external_url: string
}
