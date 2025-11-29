// Gnars flow configuration for cast verification rules
// Maps flow contract addresses to their rule IDs and computed tags

export const GNARS_FLOW_CONFIG: Record<
  string,
  { ruleId: number; computedTag: string; name: string }
> = {
  "0xd5d771956cda5979da550484ea50cc5f730298b9": {
    ruleId: 10,
    computedTag: "gnars:shredders",
    name: "Shredders",
  },
  "0x093a47a047da46ecb76c9b52350a8d239de1d15b": {
    ruleId: 11,
    computedTag: "gnars:storytelling",
    name: "Storytellers",
  },
}

// Get the computed tag for a flow, or return the flowId itself if not a Gnars flow
export function getComputedTagForFlow(flowId: string): string {
  const config = GNARS_FLOW_CONFIG[flowId.toLowerCase()]
  return config?.computedTag ?? flowId
}

// Get the rule ID for a flow (returns undefined if not configured)
export function getRuleIdForFlow(flowId: string): number | undefined {
  return GNARS_FLOW_CONFIG[flowId.toLowerCase()]?.ruleId
}

// Convert an array of flowIds/grantIds to their computed tags
export function getComputedTagsForIds(ids: string[]): string[] {
  return ids.map((id) => getComputedTagForFlow(id))
}
