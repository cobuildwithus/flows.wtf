import { customFlows as customFlowAddresses } from "@/addresses"

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
    // flowId: customFlowAddresses.grounds,
    flowId: "0xa35ea72bc5bd27f459d89d136f09775170aa78d7",
    coverImage: "/grounds-bg.jpg",
    styles: {
      light: {
        "--muted": "0 93.3% 94.1%",
        "--muted-foreground": "0 74.7% 15.5%",
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
] as const

export function getCustomFlow(id: CustomFlowId) {
  return customFlows.find((a) => a.id === id)
}

export function getCustomFlowById(flowId: string) {
  return customFlows.find((a) => a.flowId === flowId)
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
