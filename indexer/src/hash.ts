import { createHash } from "crypto"

export const getContentHash = (content: string, type: string) => {
  const contentHash = createHash("sha256").update(`${type}-${content}`).digest("hex")
  return contentHash
}
