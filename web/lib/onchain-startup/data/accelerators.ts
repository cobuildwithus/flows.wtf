import { accelerators as acceleratorAddresses } from "@/addresses"

type AcceleratorId = `0x${string}`

export type Accelerator = {
  id: AcceleratorId
  name: string
  flowId: string
  coverImage: string
  color: string
  slug: string
}

const accelerators: Accelerator[] = [
  {
    id: acceleratorAddresses.vrbs,
    name: "Vrbs",
    flowId: acceleratorAddresses.vrbs,
    coverImage: "/vrbs-bg.png",
    color: "#22c55e",
    slug: "vrbs",
  },
] as const

export function getAccelerator(id: AcceleratorId) {
  const accelerator = accelerators.find((a) => a.id === id)

  if (!accelerator) throw new Error(`Accelerator ${id} not found`)
  return accelerator ?? null
}

export function tryGetAccelerator(id: AcceleratorId) {
  return accelerators.find((a) => a.id === id) ?? null
}
