"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { AnimatedSalary } from "@/components/global/animated-salary"
import { accelerators as acceleratorAddresses } from "@/addresses"
import { HeroTextAnimator } from "./hero-text-animator"

interface Props {
  totalEarned: number
  monthlyFlowRate: number
  totalBuilders: number
}

export function HeroContent({ totalEarned, monthlyFlowRate, totalBuilders }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="max-w-5xl text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100 md:text-6xl lg:text-7xl">
        The growth engine <span className="block sm:inline">for your </span>
        <HeroTextAnimator />
      </h1>
      <p className="mt-6 max-w-xl text-base md:text-2xl">
        The AI-powered project accelerator. Fueled by global talent, coordinated by AI, owned by
        you.
      </p>

      {/* CTAs */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link
          href={`/apply/${acceleratorAddresses.vrbs}`}
          className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        >
          Grow your project
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center justify-center rounded-md border-2 border-emerald-600 px-8 py-4 text-lg font-medium text-emerald-600 transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-950"
        >
          Contribute
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
          <strong>
            <AnimatedSalary value={totalEarned} monthlyRate={monthlyFlowRate} />
          </strong>{" "}
          earned by <strong>{totalBuilders}</strong> builders
        </span>
      </motion.div>

      {/* Trust badges */}
    </motion.div>
  )
}
