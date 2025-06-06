"use client"

import { useQueryParams } from "@/lib/update-search-params"
import { cn } from "@/lib/utils"
import type { Impact } from "@prisma/flows"
import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useRef } from "react"

interface Props {
  impact: Impact
  x: number
  y: number
  delay: number
  itemSize: number
  isActive: boolean
  isFirstOfMonth: boolean
}

export function FlowImpactSummaryItem(props: Props) {
  const { impact, x, y, delay, itemSize, isActive, isFirstOfMonth } = props
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { updateQueryParam } = useQueryParams()

  useEffect(() => {
    if (isActive && isFirstOfMonth && buttonRef.current) {
      const container = document.getElementById("impact-container")
      if (container) {
        const containerRect = container.getBoundingClientRect()
        const buttonRect = buttonRef.current.getBoundingClientRect()
        const offset = buttonRect.left - containerRect.left
        container.scrollBy({ left: offset, behavior: "smooth" })
      }
    }
  }, [isActive, isFirstOfMonth])

  const bestImage = impact.bestImage.horizontal?.raw || impact.bestImage.url

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <button
        onClick={() => updateQueryParam("impactId", impact.id)}
        ref={buttonRef}
        className={cn("group absolute transition-all duration-200 hover:z-10", {
          "opacity-40 hover:opacity-100": !isActive,
        })}
        style={
          {
            "--x": x,
            "--y": y,
            "--transform": `translate(calc(var(--x) * 100% * var(--hex-spacing-x)), calc(var(--y) * 100% * var(--hex-spacing-y))) rotateX(15deg) rotateZ(-3deg)`,
            transform: "var(--transform)",
            clipPath: "polygon(50% 100%, 93.3% 75%, 93.3% 25%, 50% 0%, 6.7% 25%, 6.7% 75%)",
            width: "var(--item-size)",
            height: "var(--item-size)",
          } as React.CSSProperties
        }
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "var(--transform) scale(1.25)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "var(--transform)"
        }}
      >
        {bestImage && (
          <Image
            src={bestImage}
            alt={impact.name}
            className="absolute inset-0 size-full object-cover"
            width={itemSize}
            height={itemSize}
          />
        )}
        <div className="relative flex size-full items-center justify-center bg-gradient-to-b from-transparent via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex px-5 text-[11px] font-medium leading-relaxed text-white md:text-xs">
            {impact.name}
          </span>
        </div>
      </button>
    </motion.div>
  )
}
