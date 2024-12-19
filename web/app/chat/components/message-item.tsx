"use client"

import { Markdown } from "@/components/ui/markdown"
import { AgentType } from "@/lib/ai/agents/agent"
import Flo from "@/public/flo.png"
import Gonzo from "@/public/gonzo.svg"
import { Attachment, ToolInvocation } from "ai"
import Image from "next/image"
import { ReactNode } from "react"
import { PreviewAttachment } from "./preview-attachment"
import { SubmitApplicationResult } from "./tools/submit-application"
import { SuccessMessageResult } from "./tools/success-message"

interface Props {
  role: string
  content: string | ReactNode
  toolInvocations?: Array<ToolInvocation> | undefined
  attachments?: Array<Attachment>
  type: AgentType
}

export const MessageItem = (props: Props) => {
  const { role, content, toolInvocations, attachments, type } = props

  return (
    <div
      className="group/message mx-auto w-full max-w-full px-4 animate-in fade-in slide-in-from-bottom-1 md:max-w-3xl"
      data-role={role}
    >
      <div className="flex w-full max-w-full gap-4 group-data-[role=user]/message:ml-auto group-data-[role=user]/message:w-fit md:group-data-[role=user]/message:max-w-xl">
        {role === "assistant" && (
          <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-border md:size-10">
            <Image
              src={type === "gonzo" ? Gonzo : Flo}
              alt={type}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="flex w-full flex-col gap-2 rounded-xl p-3 shadow group-data-[role=assistant]/message:bg-primary/10 group-data-[role=user]/message:bg-card dark:group-data-[role=user]/message:border md:px-5 md:py-3.5">
          {content && (
            <div className="flex flex-col gap-4 whitespace-pre-wrap break-words text-sm leading-6">
              {typeof content === "string" ? <Markdown links="pill">{content}</Markdown> : content}
            </div>
          )}

          {attachments && (
            <div className="flex gap-2.5 overflow-x-auto">
              {attachments.map((attachment) => (
                <PreviewAttachment key={attachment.url} attachment={attachment} />
              ))}
            </div>
          )}
        </div>
      </div>
      {toolInvocations && (
        <div className="mt-4 flex flex-col items-center gap-2">
          {toolInvocations.map((tool) => {
            const { toolName, toolCallId, state } = tool

            if (state === "result") {
              switch (toolName) {
                case "submitApplication":
                  return <SubmitApplicationResult key={toolCallId} draftId={Number(tool.result)} />
                case "updateStory":
                case "updateGrant":
                  return <SuccessMessageResult key={toolCallId} message={tool.result} />
                default:
                  return null
              }
            }
          })}
        </div>
      )}
    </div>
  )
}
