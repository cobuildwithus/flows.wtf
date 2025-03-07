import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getUser } from "@/lib/auth/user"
import { getFlow } from "@/lib/database/queries/flow"
import { ApplicationChat } from "./components/application-chat"

interface Props {
  params: Promise<{ flowId: string }>
}

export default async function ApplyPage(props: Props) {
  const { flowId } = await props.params

  const [flow, user] = await Promise.all([getFlow(flowId), getUser()])

  const chatId = `chat-${flow.id}-${user?.address}`

  return (
    <AgentChatProvider
      id={chatId}
      type="flo"
      user={user}
      data={{ flowId }}
      identityToken={await getPrivyIdToken()}
    >
      <ApplicationChat flow={flow} title={flow.title} subtitle="Grant application" />
    </AgentChatProvider>
  )
}
