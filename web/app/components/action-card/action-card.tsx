import "server-only"

import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { User } from "@/lib/auth/user"
import { kv } from "@vercel/kv"
import { cookies } from "next/headers"
import { ActionCardContent } from "./action-card-content"
import { getGuidanceCacheKey, guidanceSchema } from "./guidance-utils"

interface Props {
  user?: User
  hasSession: boolean
}

export async function ActionCard(props: Props) {
  const { user, hasSession } = props

  const cachedGuidance = await kv.get(getGuidanceCacheKey(user?.address))
  const { data } = guidanceSchema.safeParse(cachedGuidance)

  return (
    <AgentChatProvider
      id={`action-card-${user?.address.toLowerCase()}-${new Date().toISOString().split("T")[0]}`}
      type="flo"
      user={user}
      identityToken={await getPrivyIdToken()}
    >
      <ActionCardContent
        hasSession={hasSession}
        user={user}
        animated={!data || (!user && !(await cookies()).has("guidance-guest"))}
        text={data?.text}
        action={data?.action}
      />
    </AgentChatProvider>
  )
}
