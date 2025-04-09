"use client"

import SignInWithNeynar from "@/components/global/signin-with-neynar"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getSignerUUID } from "@/lib/auth/farcaster-signer-uuid"
import { type NewCastData, publishCast } from "@/lib/farcaster/publish-cast"
import FarcasterLogo from "@/public/farcaster.svg"
import Image from "next/image"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useAgentChat } from "../agent-chat"
import { VideoPlayer } from "@/components/ui/video-player"

export const CastPreview = (props: NewCastData) => {
  const { text, embeds } = props
  const { user, append } = useAgentChat()
  const [status, setStatus] = useState<"idle" | "publishing" | "published">("idle")
  const [editableText, setEditableText] = useState(text)
  const rows = useMemo(() => {
    const lineCount = editableText.split("\n").length
    return Math.min(Math.max(lineCount, 2), 10)
  }, [editableText])

  if (typeof text !== "string" || text.length === 0) return null

  if (!user) return null

  return (
    <div className="w-full py-3">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col gap-2 rounded-xl border-[3px] border-[#7C65C1] bg-background/50">
          <textarea
            className="w-full resize-none rounded-md border-b-0 bg-transparent p-5 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            rows={rows + 1}
            style={{ height: "auto" }}
          />
          <div className="flex gap-2.5 overflow-x-auto">
            {embeds?.map((embed) =>
              embed.url.endsWith(".m3u8") ? (
                <div
                  className="aspect-video h-32 w-auto overflow-hidden rounded-md"
                  key={embed.url}
                >
                  <VideoPlayer
                    url={embed.url}
                    width="100%"
                    height="100%"
                    className="aspect-video"
                  />
                </div>
              ) : (
                <img
                  src={embed.url}
                  alt="Embed"
                  className="aspect-video h-32 w-auto rounded-md object-cover"
                  width={142}
                  height={80}
                  key={embed.url}
                />
              ),
            )}
          </div>
        </div>
        <div className="flex w-full justify-between gap-2.5">
          <div className="flex items-center gap-1.5">
            <Avatar className="size-6 bg-accent text-xs">
              <AvatarImage src={user.avatar} alt={user.username} />
            </Avatar>
            <span className="text-xs font-semibold">{user.username}</span>
          </div>
          {user.fid && user.hasSignerUUID && (
            <Button
              className="rounded-xl bg-[#7C65C1] text-white hover:bg-[#6944BA]"
              disabled={status !== "idle"}
              loading={status === "publishing"}
              onClick={async () => {
                const toastId = toast.loading("Publishing cast...")
                try {
                  setStatus("publishing")
                  if (!user.fid) throw new Error("No FID found")
                  const signerUUID = await getSignerUUID(user.fid)
                  if (!signerUUID) throw new Error("No signer UUID found")
                  const publication = await publishCast(signerUUID, {
                    ...props,
                    text: editableText,
                  })
                  toast.success("Cast published!", { id: toastId })
                  setStatus("published")
                  append({
                    role: "user",
                    content: `I've published the cast! https://warpcast.com/${user.username}/${publication.cast.hash}`,
                  })
                } catch (error) {
                  console.error(error)
                  toast.error((error as Error).message, { id: toastId })
                  setStatus("idle")
                }
              }}
            >
              <Image src={FarcasterLogo} alt="Farcaster" className="mr-1 h-5 w-auto" priority />
              Publish <span className="hidden md:inline">&nbsp;reply</span>
            </Button>
          )}
          {!user.hasSignerUUID && <SignInWithNeynar user={user} />}
        </div>
      </div>
    </div>
  )
}
