"use client"

import { cn } from "@/lib/utils"
import { motion, MotionProps } from "framer-motion"
import { HTMLAttributes } from "react"

type MotionSpanProps = MotionProps & HTMLAttributes<HTMLSpanElement>
const MotionSpan: React.FC<MotionSpanProps> = motion.span

export function DotLoader(props: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-1", props.className)}>
      {[0, 1, 2].map((i) => (
        <MotionSpan
          key={i}
          className="size-2 rounded-full bg-secondary-foreground/50"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
