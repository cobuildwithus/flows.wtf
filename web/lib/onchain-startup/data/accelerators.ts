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
  {
    id: "grounds",
    name: "Grounds",
    flowId: acceleratorAddresses.grounds,
    coverImage: "/grounds-bg.png",
    color: "#991b1b",
  },
  {
    id: "gnars",
    name: "Gnars",
    flowId: acceleratorAddresses.gnars,
    coverImage: "/vrbs-bg.jpg", // TODO
    color: "#000000", // TODO
  },
] as const

export function getAccelerator(id: AcceleratorId) {
  const accelerator = accelerators.find((a) => a.id === id)

  if (!accelerator) throw new Error(`Accelerator ${id} not found`)
  return accelerator
}
