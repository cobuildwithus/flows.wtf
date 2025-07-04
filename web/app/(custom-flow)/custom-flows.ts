import { accelerators, customFlows as customFlowAddresses } from "@/addresses"

export type CustomFlowId = keyof typeof customFlowAddresses

export type CustomFlow = {
  id: CustomFlowId
  name: string
  flowId: string
  coverImage: string
  styles: {
    light?: Record<`--${string}`, string>
    dark?: Record<`--${string}`, string>
  }
}

const customFlows: CustomFlow[] = [
  {
    id: "grounds",
    name: "Grounds",
    flowId: customFlowAddresses.grounds,
    coverImage: "/grounds-bg.jpg",
    styles: {
      light: {
        "--muted": "0 93.3% 94.1%",
        "--muted-foreground": "0 74.7% 12.5%",
        "--primary": "0 84.2% 60.2%",
      },
    },
  },
  {
    id: "gnars",
    name: "Gnars",
    flowId: customFlowAddresses.gnars,
    coverImage: "/gnars-bg.jpg",
    styles: {
      light: {
        "--muted": "54 100% 88%",
        "--muted-foreground": "28 72% 25%",
        "--primary": "48 98% 64%",
        "--primary-foreground": "0 0% 0%",
      },
    },
  },
  {
    id: "gardens",
    name: "Gardens",
    flowId: customFlowAddresses.gardens,
    coverImage: "/gardens-bg.png",
    styles: {
      light: {
        "--muted": "120 60% 90%",
        "--muted-foreground": "120 40% 20%",
        "--primary": "120 70% 50%",
        "--primary-foreground": "0 0% 100%",
      },
    },
  },
] as const

export function getCustomFlow(id: CustomFlowId) {
  return customFlows.find((a) => a.id === id)
}

export function getCustomFlowById(flowId: string) {
  return customFlows.find((a) => a.flowId === flowId)
}

export function getAcceleratorFlow(flowId: string) {
  return Object.entries(accelerators).find(([key, address]) => address === flowId)?.[0]
}

export function getCustomVariables() {
  const variables = new Set<string>()

  customFlows.forEach((flow) => {
    Object.keys(flow.styles.light || []).forEach((variable) => {
      variables.add(variable)
    })

    Object.keys(flow.styles.dark || []).forEach((variable) => {
      variables.add(variable)
    })
  })

  return Array.from(variables)
}
