import { customFlows as customFlowAddresses } from "@/addresses"

export type CustomFlowId = keyof typeof customFlowAddresses

export type CustomFlow = {
  id: CustomFlowId
  name: string
  flowId: string
  coverImage: string
  color: string
}

const customFlows: CustomFlow[] = [
  {
    id: "grounds",
    name: "Grounds",
    flowId: customFlowAddresses.grounds,
    coverImage: "/grounds-bg.png",
    color: "#991b1b",
  },
  {
    id: "gnars",
    name: "Gnars",
    flowId: customFlowAddresses.gnars,
    coverImage: "/vrbs-bg.jpg", // TODO
    color: "#000000", // TODO
  },
] as const

export function getCustomFlow(id: CustomFlowId) {
  const customFlow = customFlows.find((a) => a.id === id)

  if (!customFlow) throw new Error(`Flow ${id} not found`)
  return customFlow
}
