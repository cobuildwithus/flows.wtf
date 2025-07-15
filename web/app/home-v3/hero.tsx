"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { AnimatedSalary } from "@/components/global/animated-salary"
import { useEffect, useState } from "react"
import Globe from "./globe"

interface Props {
  totalEarned: number
  monthlyFlowRate: number
}

const Hero = ({ totalEarned, monthlyFlowRate }: Props) => {
  const [currentWord, setCurrentWord] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [text, setText] = useState("")
  const [delta, setDelta] = useState(200)

  useEffect(() => {
    const ticker = setInterval(() => {
      tick()
    }, delta)

    return () => clearInterval(ticker)
  }, [text, isDeleting, currentWord])

  const tick = () => {
    const fullText = builders[currentWord]
    const updatedText = isDeleting
      ? fullText.substring(0, text.length - 1)
      : fullText.substring(0, text.length + 1)

    setText(updatedText)

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true)
      setDelta(2000) // Pause before deleting
    } else if (isDeleting && updatedText === "") {
      setIsDeleting(false)
      setCurrentWord((prev) => (prev + 1) % builders.length)
      setDelta(200)
    } else {
      setDelta(isDeleting ? 50 : 100)
    }
  }

  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-gradient-to-b">
      {/* Globe positioned on the right side */}
      <Globe className="pointer-events-auto absolute right-0 top-1/2 z-20 h-full w-1/2 translate-x-1/4 scale-[1.5] md:-translate-y-1/4 lg:w-[45%] lg:translate-x-1/3 lg:scale-[2]" />

      <div className="container relative z-30 mx-auto px-4 py-20">
        <div>
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="max-w-5xl text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100 md:text-6xl lg:text-7xl">
              A startup accelerator <span className="block sm:inline">owned by </span>
              <span className="inline-block w-full overflow-visible bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text pb-2 text-transparent sm:w-auto sm:leading-normal">
                {text || "\u00A0"}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-muted-foreground md:text-2xl">
              The world&apos;s first AI driven startup accelerator. Fueled by global talent,
              coordinated by AI, owned by you.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/apply"
                className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                Start a venture
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center rounded-md border-2 border-emerald-600 px-8 py-4 text-lg font-medium text-emerald-600 transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              >
                Join or invest
              </Link>
            </div>

            {/* Live metric */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-8 flex items-center gap-3 text-muted-foreground"
            >
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-base md:text-lg">
                <AnimatedSalary value={totalEarned} monthlyRate={monthlyFlowRate} /> earned so far
              </span>
            </motion.div>

            {/* Trust badges */}
          </motion.div>

          {/* Right side - Visual */}
        </div>
      </div>
    </section>
  )
}

export default Hero

const builders = [
  "builders",
  "founders",
  "designers",
  "hackers",
  "scientists",
  "creators",
  "marketers",
  "engineers",
  "inventors",
  "makers",
  "visionaries",
  "leaders",
  "dreamers",
  "innovators",
  "artists",
  "entrepreneurs",
  "educators",
  "writers",
  "activists",
  "developers",
  "architects",
  "organizers",
  "you",
]
