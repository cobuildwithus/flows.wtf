import { postToEmbeddingsQueueRequest } from "../../queue/queue"
import { EmbeddingTag, JobBody } from "../../queue/job"
import { RecipientType } from "../../enums"
import { getNonzeroLowercasedAddresses } from "../../queue/helpers"
import { deleteEmbeddingRequest } from "../../queue/queue"
import { getContentHash } from "../../hash"
import { cleanTextForEmbedding } from "../../clean"
import { Grant } from "../../../types"

export async function addGrantEmbedding(
  grant: Grant,
  recipientType: RecipientType,
  parentId: string
) {
  if (recipientType === RecipientType.ExternalAccount) {
    return embedGrant(grant, parentId)
  }
  if (recipientType === RecipientType.FlowContract) {
    return embedFlowContract(grant, parentId)
  }

  throw new Error("Invalid recipient type")
}

export async function removeGrantEmbedding(grant: Grant) {
  const content = getGrantContent(grant)
  const type = grant.isFlow ? "flow" : "grant"
  const contentHash = getContentHash(content, type)
  await deleteEmbeddingRequest(contentHash, type)
}

const getGrantContent = (grant: Grant) => {
  return cleanTextForEmbedding(
    `This is an approved grant submitted by ${grant.submitter} for ${
      grant.recipient
    }. Here is the grant data: ${JSON.stringify({
      title: grant.title,
      description: grant.description,
      tagline: grant.tagline,
      isFlow: grant.isFlow,
    })}`
  )
}

async function embedGrant(grant: Grant, parentId: string) {
  const users = getNonzeroLowercasedAddresses([grant.recipient])

  const content = getGrantContent(grant)

  const payload: JobBody = {
    type: "grant",
    content,
    groups: ["nouns"],
    users,
    tags: [EmbeddingTag.Grants, parentId],
    externalId: grant.id.toString(),
  }

  await postToEmbeddingsQueueRequest(payload)
}

const getFlowContractContent = (grant: Grant) => {
  const cleanedGrant = cleanTextForEmbedding(
    JSON.stringify({
      title: grant.title,
      description: grant.description,
      tagline: grant.tagline,
      isFlow: grant.isFlow,
    })
  )
  return `this is a flow contract budget that people can apply for. here is the flow data: ${cleanedGrant}`
}

async function embedFlowContract(grant: Grant, parentId: string) {
  const users = getNonzeroLowercasedAddresses([grant.recipient])

  const content = getFlowContractContent(grant)

  const payload: JobBody = {
    type: "flow",
    content,
    groups: ["nouns"],
    users,
    tags: [EmbeddingTag.Flows, parentId],
    externalId: grant.id.toString(),
  }

  await postToEmbeddingsQueueRequest(payload)
}
