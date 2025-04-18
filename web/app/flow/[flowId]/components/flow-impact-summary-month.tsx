"use client"

import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Props {
  date: string
  summary: string
}

export const FlowImpactSummaryMonth = (props: Props) => {
  const { date, summary } = props
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={date}
        className={cn("mt-1.5 max-w-[800px] text-pretty text-base font-light leading-loose", {
          "min-h-[128px]": summary.length > 0,
        })}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {summary}
      </motion.p>
    </AnimatePresence>
  )
}
