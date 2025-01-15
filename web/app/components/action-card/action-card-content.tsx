"use client"

import { Button } from "@/components/ui/button"
import { Markdown } from "@/components/ui/markdown"
import { User } from "@/lib/auth/user"
import { useAnimatedText } from "@/lib/hooks/use-animated-text"
import { isBrowser } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import { Guidance } from "./get-guidance"
import { GuidanceChat } from "./guidance-chat"

interface Props {
  guidance: Promise<Guidance>
  user?: User
}

export function ActionCardContent(props: Props) {
  const { guidance, user } = props
  const [show, setShow] = useState(false)
  const [animate, setAnimate] = useState(false)
  const { text, action } = use(guidance)

  useEffect(() => {
    if (!isBrowser()) return
    setAnimate(window.sessionStorage.getItem("hasAnimatedActionCard") !== "true")
    setShow(true)
  }, [])

  const animatedText = useAnimatedText(text, "char", !animate, () => {
    window?.sessionStorage?.setItem("hasAnimatedActionCard", "true")
  })

  if (!show) return null

  const Component = animate ? motion.div : "div"
  const motionProps = animate ? { animate: { opacity: [0, 1] }, transition: { delay: 4.5 } } : {}

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="mb-5 space-y-4 text-sm text-secondary-foreground/75 [&>*]:leading-loose">
          <Markdown>{animatedText}</Markdown>
        </div>
      </motion.div>
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
