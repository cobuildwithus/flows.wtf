export type AcceleratorId = "vrbs" | "grounds" | "gnars"

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
    flowId: "0xca1d9e8a93f316ef7e6f880116a160333d085f92",
    coverImage: "/vrbs-bg.jpg",
    color: "#22c55e",
  },
  {
    id: "grounds",
    name: "Grounds",
    flowId: "0xca1d9e8a93f316ef7e6f880116a160333d085f92",
    coverImage: "/grounds-bg.png",
    color: "#991b1b",
  },
  {
    id: "gnars",
    name: "Gnars",
    flowId: "0xca1d9e8a93f316ef7e6f880116a160333d085f92",
    coverImage: "/vrbs-bg.jpg", // TODO
    color: "#000000", // TODO
  },
] as const

export function getAccelerator(id: AcceleratorId) {
  const accelerator = accelerators.find((a) => a.id === id)

  if (!accelerator) throw new Error(`Accelerator ${id} not found`)
  return accelerator
}
