"use client"

import { Button } from "@/components/ui/button"
import { Markdown } from "@/components/ui/markdown"
import { User } from "@/lib/auth/user"
import { useAnimatedText } from "@/lib/hooks/use-animated-text"
import { isBrowser } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"
import { use } from "react"
import { Guidance } from "./get-guidance"
import { GuidanceChat } from "./guidance-chat"

interface Props {
  guidance: Promise<Guidance>
  user?: User
}

export function ActionCardContent(props: Props) {
  const { guidance, user } = props

  const { text, action } = use(guidance)

  const animate = isBrowser() && !sessionStorage.getItem("hasAnimatedActionCard")

  const animatedText = useAnimatedText(text, "char", !animate, () => {
    if (isBrowser()) {
      sessionStorage.setItem("hasAnimatedActionCard", "true")
    }
  })

  const Component = animate ? motion.div : "div"
  const motionProps = animate ? { animate: { opacity: [0, 1] }, transition: { delay: 4.5 } } : {}

  return (
    <>
      <div className="mb-5 space-y-4 text-sm text-secondary-foreground/75 [&>*]:leading-loose">
        <Markdown>{animatedText}</Markdown>
      </div>
      <Component {...motionProps}>
        {action.isChat ? (
          <GuidanceChat user={user} context={text}>
            {action.text}
          </GuidanceChat>
        ) : (
          <Button key={action.link} variant="ai-secondary" size="md">
            <Link href={action.link || "#"}>{action.text}</Link>
          </Button>
        )}
      </Component>
    </>
  )
}
