import "server-only"

import { extractAttachments } from "@/lib/ai/utils/attachments"
import database from "@/lib/database/edge"
import { CoreMessage } from "ai"
import { ChatBody } from "./chat-body"

type Props = Omit<ChatBody, "messages"> & {
  messages: CoreMessage[]
  address: string | undefined
}

export async function saveConversation(props: Props) {
  const { messages, id, type, data, address } = props

  const update = {
    type,
    data: JSON.stringify(data || {}),
    messages: JSON.stringify(messages),
    user: address || "guest",
    attachments: extractAttachments(messages),
  }

  const conversation = await database.conversation.upsert({
    where: { id },
    create: { id, ...update },
    update,
  })

  console.debug(`Stored ${messages.length} messages in ${conversation.id}`)
}
