import { TimeUnit } from "./operation-type"

export function calculateFlowratePerSecond({
  amountWei,
  timeUnit,
}: {
  amountWei: bigint
  timeUnit: TimeUnit
}) {
  return amountWei / BigInt(timeUnit)
}
