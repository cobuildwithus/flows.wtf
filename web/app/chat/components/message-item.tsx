"use client"

import { Markdown } from "@/components/ui/markdown"
import type { AgentType } from "@/lib/enums"
import { getThumbnailUrlFromCloudflareStream } from "@/lib/file-upload/get-thumbnail-url-from-cloudflare-stream"
import { cn } from "@/lib/utils"
import Flo from "@/public/flo.png"
import Gonzo from "@/public/gonzo.svg"
import type { UIMessage, UIMessagePart } from "ai"
import Image from "next/image"
import type { ReactNode } from "react"
import { PreviewAttachment } from "./preview-attachment"
import { CastPreview } from "./tools/cast-preview"
import { RequestGrantRemoval } from "./tools/request-grant-removal"
import { SubmitApplicationResult } from "./tools/submit-application"
import { SuccessMessageResult } from "./tools/success-message"
import { ChallengeGrantApplication } from "./tools/challenge-grant-application"

interface Props {
  role: string
  content: string | ReactNode
  toolInvocations?: UIMessage["parts"]
  attachments?: Array<{ url: string }>
  type: AgentType
}

export const MessageItem = (props: Props) => {
  const { role, content, toolInvocations, attachments, type } = props

  return (
    <div
      className="group/message mx-auto w-full max-w-full px-4 animate-in fade-in slide-in-from-bottom-1 md:max-w-3xl"
      data-role={role}
    >
      {content && (
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

          <div
            className={cn(
              "flex w-full flex-col gap-2 rounded-3xl p-3 shadow group-data-[role=assistant]/message:bg-primary/10 group-data-[role=user]/message:bg-card dark:group-data-[role=user]/message:border md:px-5 md:py-3.5",
            )}
          >
            {content && (
              <div className="flex flex-col gap-4 whitespace-pre-wrap break-words text-sm leading-6">
                {typeof content === "string" ? (
                  <Markdown links="pill">{content}</Markdown>
                ) : (
                  content
                )}
              </div>
            )}

            {attachments && (
              <div className="flex gap-2.5 overflow-x-auto">
                {attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={getPreviewFromAttachment(attachment)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {toolInvocations && (
        <div
          className={cn("flex flex-col items-center gap-2", {
            "mt-4": !!content,
          })}
        >
          {toolInvocations
            .filter((p) => (p as UIMessagePart<any, any>).type?.toString().startsWith("tool-"))
            .map((p) => {
              const part = p as unknown as {
                type: string
                toolCallId: string
                state: string
                input?: any
                output?: any
                errorText?: string
              }
              const name = part.type.replace(/^tool-/, "")
              if (part.state === "output-available") {
                switch (name) {
                  case "submitApplication":
                    return (
                      <SubmitApplicationResult
                        key={part.toolCallId}
                        draftId={Number((part as any).output)}
                      />
                    )
                  case "updateStory":
                  case "updateGrant":
                  case "updateImpact":
                  case "submitOpportunityApplication":
                    return (
                      <SuccessMessageResult key={part.toolCallId} message={(part as any).output} />
                    )
                  case "castPreview":
                    return <CastPreview key={part.toolCallId} {...(part as any).output} />
                  case "challengeGrantApplication":
                    if (
                      (part as any).output?.grantId &&
                      (part as any).output?.reason &&
                      !(part as any).output?.transactionHash
                    ) {
                      return (
                        <ChallengeGrantApplication
                          key={part.toolCallId}
                          {...(part as any).output}
                        />
                      )
                    }
                    break
                  case "requestGrantRemoval":
                    if (
                      (part as any).output?.grantId &&
                      (part as any).output?.reason &&
                      !(part as any).output?.transactionHash
                    ) {
                      return <RequestGrantRemoval key={part.toolCallId} {...(part as any).output} />
                    }
                    break
                  default:
                    return null
                }
              }
              return null
            })}
        </div>
      )}
    </div>
  )
}

function getPreviewFromAttachment(attachment: { url: string }) {
  return {
    ...attachment,
    imageUrl: attachment.url.includes(".m3u8")
      ? (getThumbnailUrlFromCloudflareStream(attachment.url) ?? "")
      : attachment.url,
    name: attachment.url.split("/").pop() ?? "",
    contentType: attachment.url.split(".").pop() ?? "",
  }
}
