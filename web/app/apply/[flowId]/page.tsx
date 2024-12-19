import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { getUser } from "@/lib/auth/user"
import { getFlow } from "@/lib/database/queries/flow"
import { ApplicationChat } from "./components/application-chat"

export const runtime = "nodejs"

interface Props {
  params: Promise<{ flowId: string }>
}

export default async function ApplyPage(props: Props) {
  const { flowId } = await props.params

  const flow = await getFlow(flowId)
  const user = await getUser()

  const chatId = `chat-${flow.id}-${user?.address}`

  return (
    <AgentChatProvider id={chatId} type="flo" user={user} data={{ flowId }}>
      <ApplicationChat flow={flow} title={flow.title} subtitle="Grant application" />
    </AgentChatProvider>
  )
}
