import "server-only"

import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { DotLoader } from "@/components/ui/dot-loader"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getUser } from "@/lib/auth/user"
import { Suspense } from "react"
import { ActionCardContent } from "./action-card-content"
import { getGuidance } from "./get-guidance"

export async function ActionCard() {
  const user = await getUser()
  const identityToken = await getPrivyIdToken()

  const guidance = getGuidance(user?.address, identityToken)

  return (
    <AgentChatProvider
      id={`action-card-${user?.address.toLowerCase()}-${new Date().toISOString().split("T")[0]}`}
      type="flo"
      user={user}
      identityToken={identityToken}
    >
      <h2 className="mb-2.5 text-lg font-semibold text-secondary-foreground">
        {user ? `gm ${user.username}` : "Creators welcome"}
      </h2>
      <Suspense fallback={<DotLoader className="pt-2.5" />}>
        <ActionCardContent user={user} guidance={guidance} />
      </Suspense>
    </AgentChatProvider>
  )
}
