type StepTimings = Record<string, number>

function nowMs(): number {
  // Use high-resolution time where available
  // Node 18+: process.hrtime.bigint()
  try {
    const ns = (process.hrtime as any).bigint?.() as bigint | undefined
    if (ns !== undefined) return Number(ns / 1_000_000n)
  } catch {
    // Ignore: fallback to Date.now()
  }
  return Date.now()
}

const PERF_TIMING_ENABLED = process.env.PERF_TIMING === "true"
const PERF_MIN_MS = Number.isFinite(Number(process.env.PERF_MIN_MS))
  ? Number(process.env.PERF_MIN_MS)
  : 100

export async function timeHandler<T>(
  info: {
    handler: string
    // Ponder event minimal shape used for logging
    event: {
      block?: { number?: number | bigint; timestamp?: number | bigint }
      log?: { transactionHash?: string; logIndex?: number }
    }
    context: { chain?: { id?: number } }
  },
  fn: (api: { step: <R>(label: string, f: () => Promise<R> | R) => Promise<R> }) => Promise<T>
): Promise<T> {
  const start = nowMs()
  const steps: StepTimings = {}

  async function step<R>(label: string, f: () => Promise<R> | R): Promise<R> {
    const s = nowMs()
    try {
      return await f()
    } finally {
      const e = nowMs()
      steps[label] = (steps[label] ?? 0) + (e - s)
    }
  }

  try {
    const result = await fn({ step })
    const end = nowMs()
    const elapsedMs = end - start
    if (PERF_TIMING_ENABLED || elapsedMs >= PERF_MIN_MS) {
      const log = {
        type: "perf",
        handler: info.handler,
        chainId: info.context?.chain?.id ?? null,
        blockNumber: toNum(info.event?.block?.number),
        blockTimestamp: toNum(info.event?.block?.timestamp),
        txHash: info.event?.log?.transactionHash ?? null,
        logIndex: info.event?.log?.logIndex ?? null,
        elapsedMs,
        steps,
      }
      // Prefix for easier log search
      console.debug("PERF", JSON.stringify(log))
    }
    return result
  } catch (err) {
    const end = nowMs()
    const elapsedMs = end - start
    if (PERF_TIMING_ENABLED || elapsedMs >= PERF_MIN_MS) {
      const log = {
        type: "perf",
        handler: info.handler,
        chainId: info.context?.chain?.id ?? null,
        blockNumber: toNum(info.event?.block?.number),
        blockTimestamp: toNum(info.event?.block?.timestamp),
        txHash: info.event?.log?.transactionHash ?? null,
        logIndex: info.event?.log?.logIndex ?? null,
        elapsedMs,
        steps,
        error: String(err && (err as any).message ? (err as any).message : err),
      }
      console.debug("PERF", JSON.stringify(log))
    }
    throw err
  }
}

function toNum(v: unknown): number | null {
  if (typeof v === "number") return v
  if (typeof v === "bigint") return Number(v)
  return null
}
