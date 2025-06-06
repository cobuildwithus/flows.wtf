import { accelerators as acceleratorAddresses } from "@/addresses"

export type AcceleratorId = keyof typeof acceleratorAddresses

export type Accelerator = {
  id: AcceleratorId
  name: string
  flowId: string
  coverImage: string
  color: string
}

const accelerators: Accelerator[] = [
  {
    id: "vrbs",
    name: "Vrbs",
    flowId: acceleratorAddresses.vrbs,
    coverImage: "/vrbs-bg.jpg",
    color: "#22c55e",
  },
] as const

export function getAccelerator(id: AcceleratorId) {
  const accelerator = accelerators.find((a) => a.id === id)

  if (!accelerator) throw new Error(`Accelerator ${id} not found`)
  return accelerator
}
