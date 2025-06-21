"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const messages = [
  "Summoning the grant wizards...",
  "Synthesizing mission statement...",
  "Crafting beautiful gradients...",
  "Analyzing impact potential...",
  "Extracting key deliverables...",
  "Polishing the final touches...",
  "Almost ready to launch!",
]

export function GrantGenerating() {
  const router = useRouter()
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Cycle through messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
    }, 3000)

    // Update progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 100 / 60, 100)) // 100% in 60 seconds
    }, 1000)

    // Refresh after 1 minute
    const refreshTimeout = setTimeout(() => {
      router.refresh()
    }, 60000)

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
      clearTimeout(refreshTimeout)
    }
  }, [router])

  return (
    <div className="container mt-16 px-4">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border bg-gradient-to-br from-primary/5 to-secondary/5 p-12 md:p-16"
        >
          {/* Icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <Sparkles className="size-16 text-primary" />
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles className="size-16 text-primary" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="mb-8 text-center text-2xl font-semibold">Generating Grant Page</h2>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/20">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/60"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>

          {/* Animated Messages */}
          <div className="mb-8 flex h-12 items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center text-base font-medium text-foreground"
              >
                {messages[currentMessageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Info text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-center text-sm text-muted-foreground"
          >
            This usually takes about a minute. The page will refresh automatically.
          </motion.p>
        </motion.div>

        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="mt-8 rounded-lg border bg-secondary/10 p-4"
        >
          <p className="text-center text-sm text-muted-foreground">
            If you still see this after 2 minutes, please reach out to{" "}
            <a
              href="https://farcaster.xyz/rocketman"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
            >
              rocketman
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
