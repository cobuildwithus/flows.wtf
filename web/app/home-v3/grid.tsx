"use client"
import React, { useEffect, useRef, useState } from "react"

/* ---------- Config knobs ---------- */
const CELL_PX = 32 // each cell = 32 px
const TICK_MS = 80 // game-loop interval (faster)
const SPAWN_INTERVAL_MS = 2000 // spawn new snakes every 2 seconds
const MAX_SNAKE_LEN = 21 // grows until this length (5x longer)
const MAX_SNAKE_AGE = 220 // despawn after N ticks
// Snakes now spawn when a "growth-event-advance" CustomEvent is dispatched,
// so we no longer use probabilistic spawning
/* ---------------------------------- */

type Dir = "up" | "down" | "left" | "right"
type Point = { x: number; y: number }

interface Snake {
  id: number
  body: Point[] // head first
  dir: Dir
  age: number
  target: Point
  axisFirstX: boolean // determines path preference
  phase?: "active" | "shrinking" // shrinking once target reached
  shrinkProgress?: number // ticks spent shrinking
}

const DIR_VEC: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const Grid: React.FC = () => {
  const [snakes, setSnakes] = useState<Snake[]>([])
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    gridCellsX: 0,
    gridCellsY: 0,
  })
  const tickRef = useRef<ReturnType<typeof setInterval>>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current
        const gridCellsX = Math.ceil(offsetWidth / CELL_PX)
        const gridCellsY = Math.ceil(offsetHeight / CELL_PX)
        setDimensions({
          width: offsetWidth,
          height: offsetHeight,
          gridCellsX,
          gridCellsY,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const withinBounds = ({ x, y }: Point) =>
    x >= 0 && x < dimensions.gridCellsX && y >= 0 && y < dimensions.gridCellsY

  /* ---------- Main game loop ---------- */
  useEffect(() => {
    if (dimensions.gridCellsX === 0 || dimensions.gridCellsY === 0) return

    tickRef.current = setInterval(() => {
      setSnakes((prev) => {
        // 1. Move & age existing snakes
        const moved = prev
          .map((s) => {
            // If snake is in shrinking phase, remove tail gradually
            if (s.phase === "shrinking") {
              const newBody = s.body.slice(0, -1)
              return {
                ...s,
                body: newBody,
                shrinkProgress: (s.shrinkProgress ?? 0) + 1,
                age: s.age + 1,
              }
            }

            const head = s.body[0]

            // Check if target reached -> enter shrinking phase
            if (head.x === s.target.x && head.y === s.target.y) {
              return { ...s, phase: "shrinking" as const, shrinkProgress: 0 }
            }

            // Move toward the target by alternating axes, approximating a diagonal path.
            // We choose the axis probabilistically, weighted by the remaining distance on each axis.
            let dir: Dir = s.dir

            const dx = s.target.x - head.x
            const dy = s.target.y - head.y
            const adx = Math.abs(dx)
            const ady = Math.abs(dy)

            if (adx !== 0 || ady !== 0) {
              let chooseHorizontal: boolean

              if (adx === 0) {
                chooseHorizontal = false
              } else if (ady === 0) {
                chooseHorizontal = true
              } else {
                // Probability is proportional to remaining distance on that axis
                chooseHorizontal = Math.random() < adx / (adx + ady)
              }

              if (chooseHorizontal) {
                dir = dx > 0 ? "right" : "left"
              } else {
                dir = dy > 0 ? "down" : "up"
              }
            }

            // Ensure chosen direction is within bounds
            const attempt = {
              x: head.x + DIR_VEC[dir].x,
              y: head.y + DIR_VEC[dir].y,
            }
            if (!withinBounds(attempt)) {
              const fallback = (["up", "down", "left", "right"] as Dir[]).find((d) => {
                const n = {
                  x: head.x + DIR_VEC[d].x,
                  y: head.y + DIR_VEC[d].y,
                }
                return withinBounds(n)
              })
              if (fallback) dir = fallback
            }

            const newHead = {
              x: head.x + DIR_VEC[dir].x,
              y: head.y + DIR_VEC[dir].y,
            }

            const newBody = withinBounds(newHead) ? [newHead, ...s.body] : s.body
            if (newBody.length > MAX_SNAKE_LEN) newBody.pop()

            return { ...s, body: newBody, dir, age: s.age + 1 }
          })
          // 2. Cull finished or elderly snakes
          .filter((s) => s.age < MAX_SNAKE_AGE && s.body.length > 0)

        // No random spawning; new snakes are added via the growth-event listener
        return moved
      })
    }, TICK_MS)

    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [dimensions])

  /* ---------- Spawn snakes on an interval ---------- */
  const dimsRef = useRef(dimensions)
  useEffect(() => {
    dimsRef.current = dimensions
  }, [dimensions])

  useEffect(() => {
    const spawnSnakes = () => {
      const dims = dimsRef.current
      if (dims.gridCellsX === 0 || dims.gridCellsY === 0) return

      // Decide how many snakes to spawn (1-3)
      const count = 1 + Math.floor(Math.random() * 3) // 1,2,3

      // Single shared target for this batch
      const sharedTarget: Point = {
        x: Math.floor(Math.random() * dims.gridCellsX),
        y: Math.floor(Math.random() * dims.gridCellsY),
      }

      const sides: Array<"top" | "bottom" | "left" | "right"> = ["top", "bottom", "left", "right"]

      const pickStart = (): { start: Point; dir: Dir } => {
        const side = sides[Math.floor(Math.random() * 4)]
        switch (side) {
          case "top": {
            const x = Math.floor(Math.random() * dims.gridCellsX)
            return { start: { x, y: 0 }, dir: "down" }
          }
          case "bottom": {
            const x = Math.floor(Math.random() * dims.gridCellsX)
            return { start: { x, y: dims.gridCellsY - 1 }, dir: "up" }
          }
          case "left": {
            const y = Math.floor(Math.random() * dims.gridCellsY)
            return { start: { x: 0, y }, dir: "right" }
          }
          case "right":
          default: {
            const y = Math.floor(Math.random() * dims.gridCellsY)
            return { start: { x: dims.gridCellsX - 1, y }, dir: "left" }
          }
        }
      }

      const newSnakes: Snake[] = Array.from({ length: count }).map(() => {
        const { start, dir } = pickStart()
        return {
          id: Date.now() + Math.random(),
          body: [start],
          dir,
          age: 0,
          target: sharedTarget,
          axisFirstX: Math.random() < 0.5,
          phase: "active" as const,
          shrinkProgress: 0,
        }
      })

      setSnakes((prev) => [...prev, ...newSnakes])
    }

    const int = setInterval(spawnSnakes, SPAWN_INTERVAL_MS)
    return () => clearInterval(int)
  }, [])

  const containerStyle = {
    position: "absolute" as const,
    inset: 0,
    zIndex: 10,
    overflow: "hidden" as const,
  }

  if (dimensions.width === 0 || dimensions.height === 0) {
    return <div ref={containerRef} style={containerStyle} />
  }

  /* ---------- Render helpers ---------- */
  const viewBoxWidth = dimensions.gridCellsX * CELL_PX
  const viewBoxHeight = dimensions.gridCellsY * CELL_PX

  // Grid dots at each vertex
  const gridDots = []
  for (let x = 0; x <= dimensions.gridCellsX; x++) {
    for (let y = 0; y <= dimensions.gridCellsY; y++) {
      gridDots.push(
        <circle
          key={`dot-${x}-${y}`}
          cx={x * CELL_PX}
          cy={y * CELL_PX}
          r={2}
          fill="currentColor"
          className="text-muted-foreground/30"
        />,
      )
    }
  }

  const snakeStrokes = snakes.map((s) => (
    <polyline
      key={s.id}
      points={s.body
        .map((p) => `${p.x * CELL_PX + CELL_PX / 2},${p.y * CELL_PX + CELL_PX / 2}`)
        .join(" ")}
      fill="none"
      strokeWidth={CELL_PX * 0.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke={`hsl(${(s.id * 77) % 360} 80% 50% / 0.3)`} // more transparent deterministic color
    />
  ))

  // Deduplicate target dots so one per coordinate
  const uniqueTargets = Array.from(
    new Map(snakes.map((s) => [`${s.target.x},${s.target.y}`, s.target])).values(),
  )

  const targetDots = uniqueTargets.map((t, idx) => (
    <circle
      key={`target-${idx}`}
      cx={t.x * CELL_PX + CELL_PX / 2}
      cy={t.y * CELL_PX + CELL_PX / 2}
      r={CELL_PX * 0.25}
      fill="currentColor"
      className="text-primary/60"
    />
  ))

  return (
    <div ref={containerRef} style={containerStyle}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        width="100%"
        height="100%"
        style={{ display: "block" }}
        className="opacity-20"
        preserveAspectRatio="none"
      >
        {gridDots}
        {targetDots}
        {snakeStrokes}
      </svg>
    </div>
  )
}

export default Grid
