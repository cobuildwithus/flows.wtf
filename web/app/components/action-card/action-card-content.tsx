"use client"

import { Button } from "@/components/ui/button"
import { Markdown } from "@/components/ui/markdown"
import { User } from "@/lib/auth/user"
import { useAnimatedText } from "@/lib/hooks/use-animated-text"
import { motion } from "framer-motion"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import { createHash } from "crypto"
import { Guidance } from "./get-guidance"
import { GuidanceChat } from "./guidance-chat"

interface Props {
  guidance: Promise<Guidance>
  user?: User
}

function getLocalHashKey(text: string) {
  return createHash("md5").update(text).digest("hex")
}

export function ActionCardContent({ guidance, user }: Props) {
  const { text, action } = use(guidance)
  const [isTextAnimationComplete, setIsTextAnimationComplete] = useState(false)
  const [shouldAnimateText, setShouldAnimateText] = useState(false)

  // Check if text has changed by comparing hashes in localStorage
  useEffect(() => {
    if (!text) return
    const storedHash = localStorage.getItem("actionCardHash") || ""
    const currentHash = getLocalHashKey(text)
    if (storedHash !== currentHash) {
      localStorage.setItem("actionCardHash", currentHash)
      setShouldAnimateText(true)
    } else {
      setShouldAnimateText(false)
      setIsTextAnimationComplete(true)
    }
  }, [text])

  // Animate the text; set completion flag when done
  const animatedText = useAnimatedText(text, "char", !shouldAnimateText, () => {
    setIsTextAnimationComplete(true)
  })

  // Prevent rendering when no text is available
  if (!text) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <div className="mb-5 space-y-4 text-sm text-secondary-foreground/75 [&>*]:leading-loose">
        <Markdown>{animatedText}</Markdown>

        {isTextAnimationComplete && (
          <div>
            {action.isChat ? (
              <GuidanceChat user={user} context={text}>
                {action.text}
              </GuidanceChat>
            ) : (
              <Button variant="ai-secondary" size="md">
                <Link href={action.link || "#"}>{action.text}</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
