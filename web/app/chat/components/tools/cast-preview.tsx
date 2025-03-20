"use client"

import SignInWithNeynar from "@/components/global/signin-with-neynar"
import { Button } from "@/components/ui/button"
import { getSignerUUID } from "@/lib/auth/farcaster-signer-uuid"
import { NewCastData, publishCast } from "@/lib/farcaster/publish-cast"
import { useState } from "react"
import { toast } from "sonner"
import { useAgentChat } from "../agent-chat"

export const CastPreview = (props: NewCastData) => {
  const { text, embeds } = props
  const { user } = useAgentChat()
  const [isPublishing, setIsPublishing] = useState(false)

  if (typeof text !== "string" || text.length === 0) return null

  return (
    <div className="py-3">
      <div className="mx-auto flex max-w-[75%] flex-col items-center gap-1.5">
        <div className="flex flex-col gap-2 rounded-xl border bg-background p-5">
          <p className="text-sm">{text}</p>
          {embeds?.map((embed) => (
            <img
              src={embed.url}
              alt="Embed"
              className="h-20 rounded-xl"
              width={80}
              height={80}
              key={embed.url}
            />
          ))}
        </div>
        {user?.fid && user?.hasSignerUUID && (
          <Button
            className="rounded-2xl bg-[#7C65C1] text-white hover:bg-[#6944BA]"
            disabled={isPublishing}
            loading={isPublishing}
            onClick={async () => {
              const toastId = toast.loading("Publishing cast...")
              try {
                setIsPublishing(true)
                if (!user.fid) throw new Error("No FID found")
                const signerUUID = await getSignerUUID(user.fid)
                if (!signerUUID) throw new Error("No signer UUID found")
                await publishCast(signerUUID, props)
                toast.success("Cast published!", { id: toastId })
              } catch (error) {
                console.error(error)
                toast.error((error as Error).message, { id: toastId })
              } finally {
                setIsPublishing(false)
              }
            }}
          >
            Publish on Farcaster
          </Button>
        )}
        {user && !user?.hasSignerUUID && <SignInWithNeynar user={user} />}
      </div>
    </div>
  )
}
