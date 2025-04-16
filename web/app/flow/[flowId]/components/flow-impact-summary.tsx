"use client"

import type { Grant, Impact } from "@prisma/flows"
import Image from "next/image"

interface Props {
  flow: Grant
  impacts: Impact[]
}

export function FlowImpactSummary(props: Props) {
  const { flow, impacts } = props

  const numRows = 5
  const itemSize = 170

  return (
    <div className="relative w-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
      <div
        className="relative"
        style={
          {
            "--hex-spacing-x": "0.92",
            "--hex-spacing-y": "0.77",
            height: itemSize + itemSize * 0.85 * (numRows - 1),
          } as React.CSSProperties
        }
      >
        {impacts.map((impact, index) => {
          const col = Math.floor(index / numRows)
          const row = index % numRows

          const x = col + (row % 2) * 0.5
          const y = row

          return (
            <div
              key={impact.id}
              className="relative"
              style={{ "--delay": `${index * 0.1}s` } as React.CSSProperties}
            >
              <div
                className="absolute transition-transform duration-150 hover:z-10"
                style={
                  {
                    "--x": x,
                    "--y": y,
                    "--transform": `translate(calc(var(--x) * 100% * var(--hex-spacing-x)), calc(var(--y) * 100% * var(--hex-spacing-y))) rotateX(15deg) rotateZ(-3deg)`,
                    transform: "var(--transform)",
                    transformStyle: "preserve-3d",
                    clipPath: "polygon(50% 100%, 93.3% 75%, 93.3% 25%, 50% 0%, 6.7% 25%, 6.7% 75%)",
                    width: `${itemSize}px`,
                    height: `${itemSize}px`,
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "var(--transform) scale(1.25)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "var(--transform)"
                }}
              >
                <div className="relative h-full w-full">
                  {impact.bestImage.url && (
                    <Image
                      src={impact.bestImage.url}
                      alt={impact.name}
                      className="h-full w-full object-cover"
                      width={itemSize}
                      height={itemSize}
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
