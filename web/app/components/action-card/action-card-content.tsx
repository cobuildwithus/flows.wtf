"use client"

import { Button } from "@/components/ui/button"
import { DotLoader } from "@/components/ui/dot-loader"
import { Markdown } from "@/components/ui/markdown"
import { User } from "@/lib/auth/user"
import { useAnimatedText } from "@/lib/hooks/use-animated-text"
import { experimental_useObject as useObject } from "ai/react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { GuidanceChat } from "./guidance-chat"
import { guidanceSchema } from "./guidance-utils"
import { useAuthenticated } from "@/lib/auth/use-authenticated"

interface Props {
  user?: User
  animated: boolean
  text?: string
  action?: { link?: string; text: string; isChat: boolean }
}

export function ActionCardContent(props: Props) {
  const { user, animated } = props

  const hasSubmitted = useRef(false)
  const { ready } = useAuthenticated()

  const { object, submit, isLoading, error } = useObject({
    api: "/api/action-card",
    schema: guidanceSchema,
    onError: (error) => {
      console.error("An error occurred:", error)
      if (shouldRetry(error)) {
        retrySubmit(1, "Hello", submit)
      }
    },
  })

  const animatedText = useAnimatedText(props.text || object?.text || "", "char", !animated)

  useEffect(() => {
    if (!hasSubmitted.current && !props.text) {
      submit(`Hello`)
      hasSubmitted.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const action = props.action || object?.action
  const text = props.text || object?.text || ""

  return (
    <>
      <h2 className="text-lg font-semibold text-secondary-foreground">gm {user?.username}</h2>
      {ready && (
        <div className="mb-5 mt-2.5 space-y-4 text-sm text-secondary-foreground/75 [&>*]:leading-loose">
          {isLoading && (
            <div className="pt-2.5">
              <DotLoader />
            </div>
          )}
          {!isLoading && <Markdown>{animatedText}</Markdown>}
          {error && (
            <p className="text-destructive">An error occurred: {error.message.slice(0, 150)}</p>
          )}
        </div>
      )}

      {ready &&
        action?.text &&
        (() => {
          const Component = animated ? motion.div : "div"
          const motionProps = animated
            ? { animate: { opacity: [0, 1] }, transition: { delay: 4.5 } }
            : {}

          return (
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
          )
        })()}
    </>
  )
}

const maxRetries = 3
const retryDelay = 1000
function shouldRetry(error: Error) {
  return (
    error.message.includes("Network Error") ||
    error.message.includes("Network connection lost") ||
    error.message.includes("Failed to fetch")
  )
}

function retrySubmit(attempt: number, input: string, submit: (input: string) => void) {
  if (attempt <= maxRetries) {
    setTimeout(() => {
      console.log(`Retrying... Attempt ${attempt}`)
      submit(input)
    }, retryDelay * attempt)
  } else {
    console.error("Max retry attempts reached. Please try again later.")
  }
}
