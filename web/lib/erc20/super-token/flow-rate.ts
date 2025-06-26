export const TIME_UNIT = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400,
  week: 604800,
  month: 2592000,
  year: 31536000,
} as const

export type TimeUnit = (typeof TIME_UNIT)[keyof typeof TIME_UNIT]

export function calculateFlowratePerSecond({
  amountWei,
  timeUnit,
}: {
  amountWei: bigint
  timeUnit: TimeUnit
}) {
  return amountWei / BigInt(timeUnit)
}
