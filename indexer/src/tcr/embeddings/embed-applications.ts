import { schema } from "ponder:registry"
import { postToEmbeddingsQueueRequest } from "../../queue/queue"
import { EmbeddingTag, JobBody } from "../../queue/job"
import { getNonzeroLowercasedAddresses } from "../../queue/helpers"
import { deleteEmbeddingRequest } from "../../queue/queue"
import { getContentHash } from "../../hash"
import { cleanTextForEmbedding } from "../../clean"
import { Grant } from "../../../types"

export async function addApplicationEmbedding(grant: Grant, parentId: string) {
  const users = getNonzeroLowercasedAddresses([grant.recipient])

  const content = getApplicationContent(grant)

  const payload: JobBody = {
    type: "grant-application",
    content,
    groups: ["nouns"],
    users,
    tags: [EmbeddingTag.Flows, parentId],
    externalId: grant.id.toString(),
  }

  await postToEmbeddingsQueueRequest(payload)
}

export async function removeApplicationEmbedding(grant: Grant) {
  const content = getApplicationContent(grant)
  const contentHash = getContentHash(content, "grant-application")
  await deleteEmbeddingRequest(contentHash, "grant-application")
}

const getApplicationContent = (grant: Grant) => {
  const cleanedGrant = cleanTextForEmbedding(
    JSON.stringify({
      title: grant.title,
      description: grant.description,
      tagline: grant.tagline,
      isFlow: grant.isFlow,
    })
  )
  return `this is a grant application submitted by ${grant.submitter.toLowerCase()} for ${grant.recipient.toLowerCase()}. here is the grant application data: ${cleanedGrant}`
}
