"use client"
import React, { useEffect, useRef, useState } from "react"

/* ---------- Config knobs ---------- */
const CELL_PX = 32 // each cell = 32 px
const TICK_MS = 100 // simulation tick interval (deterministic)
const SPAWN_INTERVAL_MS = 2000 // spawn new snakes every 2 seconds
const MAX_SNAKE_LEN = 21 // grows until this length
const MAX_SNAKE_AGE = 220 // despawn after N ticks
/* ---------------------------------- */

type Dir = "up" | "down" | "left" | "right"
interface Point {
  x: number
  y: number
}

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
  /* ---------- Refs & state ---------- */
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Background canvas used to render the static grid just once
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)

  // Dimension state – only changes on resize (rare)
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    gridCellsX: 0,
    gridCellsY: 0,
  })
  const dimsRef = useRef(dimensions)

  // Entire simulation lives here; React never re-renders on every tick
  const snakesRef = useRef<Snake[]>([])
  const gridPathRef = useRef<Path2D | null>(null)

  /* ---------- Dimension handling ---------- */
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return
      const { offsetWidth: width, offsetHeight: height } = containerRef.current
      const gridCellsX = Math.ceil(width / CELL_PX)
      const gridCellsY = Math.ceil(height / CELL_PX)
      const newDims = { width, height, gridCellsX, gridCellsY }
      dimsRef.current = newDims
      setDimensions(newDims)

      // keep canvas in sync – handle HiDPI if desired (skipped for brevity)
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = width
        canvas.height = height
      }

      // Build and memoise grid Path2D for static dots
      const path = new Path2D()
      for (let x = 0; x <= gridCellsX; x++) {
        for (let y = 0; y <= gridCellsY; y++) {
          path.moveTo(x * CELL_PX + 2, y * CELL_PX)
          path.arc(x * CELL_PX, y * CELL_PX, 2, 0, Math.PI * 2)
        }
      }
      gridPathRef.current = path
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Draw static grid on the background canvas whenever dimensions change
  useEffect(() => {
    const bg = bgCanvasRef.current
    if (!bg || !gridPathRef.current) return

    // Resize to match current viewport
    bg.width = dimensions.width
    bg.height = dimensions.height

    const g = bg.getContext("2d")
    if (!g) return
    g.fillStyle = "rgba(100,100,100,0.3)"
    g.fill(gridPathRef.current)
  }, [dimensions])

  /* ---------- Helpers ---------- */
  const withinBounds = (p: Point) => {
    const { gridCellsX, gridCellsY } = dimsRef.current
    return p.x >= 0 && p.x < gridCellsX && p.y >= 0 && p.y < gridCellsY
  }

  const advanceSimulation = () => {
    const moved: Snake[] = snakesRef.current
      .map((s) => {
        // 1. Shrink if done
        if (s.phase === "shrinking") {
          const newBody = s.body.slice(0, -1)
          return {
            ...s,
            body: newBody,
            shrinkProgress: (s.shrinkProgress ?? 0) + 1,
            age: s.age + 1,
          }
        }

        // 2. Movement toward target
        const head = s.body[0]
        if (head.x === s.target.x && head.y === s.target.y) {
          return { ...s, phase: "shrinking" as const, shrinkProgress: 0 }
        }

        let dir: Dir = s.dir
        const dx = s.target.x - head.x
        const dy = s.target.y - head.y
        const adx = Math.abs(dx)
        const ady = Math.abs(dy)

        if (adx !== 0 || ady !== 0) {
          const isCurrentDirUseful = () => {
            if (dir === "left" && dx < 0) return true
            if (dir === "right" && dx > 0) return true
            if (dir === "up" && dy < 0) return true
            if (dir === "down" && dy > 0) return true
            return false
          }

          if (!isCurrentDirUseful() || Math.random() < 0.15) {
            let chooseHorizontal: boolean
            if (adx === 0) chooseHorizontal = false
            else if (ady === 0) chooseHorizontal = true
            else if (adx > ady * 1.5) chooseHorizontal = true
            else if (ady > adx * 1.5) chooseHorizontal = false
            else {
              const horizProb = Math.pow(adx, 3) / (Math.pow(adx, 3) + Math.pow(ady, 3))
              chooseHorizontal = Math.random() < horizProb
            }
            dir = chooseHorizontal ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up"
          }
        }

        // fallback if chosen dir hits boundary
        let newHead = { x: head.x + DIR_VEC[dir].x, y: head.y + DIR_VEC[dir].y }
        if (!withinBounds(newHead)) {
          const fallback = ("up down left right".split(" ") as Dir[]).find((d) => {
            const attempt = { x: head.x + DIR_VEC[d].x, y: head.y + DIR_VEC[d].y }
            return withinBounds(attempt)
          })
          if (fallback) dir = fallback
          newHead = { x: head.x + DIR_VEC[dir].x, y: head.y + DIR_VEC[dir].y }
        }

        const newBody = withinBounds(newHead) ? [newHead, ...s.body] : s.body
        if (newBody.length > MAX_SNAKE_LEN) newBody.pop()

        return { ...s, body: newBody, dir, age: s.age + 1 }
      })
      // 3. Cull finished/elderly snakes
      .filter((s) => s.age < MAX_SNAKE_AGE && s.body.length > 0)

    snakesRef.current = moved
  }

  const spawnSnakes = () => {
    const dims = dimsRef.current
    if (dims.gridCellsX === 0 || dims.gridCellsY === 0) return

    const count = 2 + Math.floor(Math.random() * 5) // 2–6 snakes
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

    snakesRef.current = [...snakesRef.current, ...newSnakes]
  }

  /* ---------- Canvas drawing ---------- */
  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height, gridCellsX, gridCellsY } = dimsRef.current
    ctx.clearRect(0, 0, width, height)

    // Static grid rendered on bgCanvas; skip drawing here

    // Target points (deduplicated)
    const uniqueTargets = Array.from(
      new Map(snakesRef.current.map((s) => [`${s.target.x},${s.target.y}`, s.target])).values(),
    )
    ctx.fillStyle = "rgba(59,130,246,0.6)" // primary-ish blue
    uniqueTargets.forEach((t) => {
      ctx.beginPath()
      ctx.arc(
        t.x * CELL_PX + CELL_PX / 2,
        t.y * CELL_PX + CELL_PX / 2,
        CELL_PX * 0.2,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    })

    // Snakes
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    snakesRef.current.forEach((s) => {
      ctx.strokeStyle = `hsla(${(s.id * 77) % 360},80%,50%,0.2)`
      ctx.lineWidth = CELL_PX * 0.15
      ctx.beginPath()
      s.body.forEach((p, idx) => {
        const px = p.x * CELL_PX + CELL_PX / 2
        const py = p.y * CELL_PX + CELL_PX / 2
        if (idx === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })
      ctx.stroke()
    })
  }

  /* ---------- Main loop (rAF) ---------- */
  useEffect(() => {
    if (dimensions.gridCellsX === 0 || dimensions.gridCellsY === 0) return

    let accumulator = 0
    let spawnAccumulator = 0
    let last = performance.now()
    let frameId: number
    let dirty = true // ensure initial frame draws

    const loop = (now: number) => {
      const dt = now - last
      last = now
      accumulator += dt
      spawnAccumulator += dt

      let stepped = false

      // Spawn new snakes on interval
      while (spawnAccumulator >= SPAWN_INTERVAL_MS) {
        spawnSnakes()
        spawnAccumulator -= SPAWN_INTERVAL_MS
        stepped = true
      }

      // Advance simulation at fixed tick rate
      while (accumulator >= TICK_MS) {
        advanceSimulation()
        accumulator -= TICK_MS
        stepped = true
      }

      if (stepped) dirty = true

      if (dirty) {
        draw()
        dirty = false
      }

      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions])
  /* ---------- Spawn interval effect removed – handled in rAF loop ---------- */

  /* ---------- Render ---------- */
  const containerStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 10,
    overflow: "hidden",
  }

  return (
    <div ref={containerRef} style={containerStyle}>
      <canvas
        ref={bgCanvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.2 }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        className="opacity-30 dark:opacity-20"
      />
    </div>
  )
}

export default Grid
