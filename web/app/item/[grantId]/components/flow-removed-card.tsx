import "server-only"

import type { Grant } from "@prisma/flows"

interface Props {
  flow: Grant
}

export function FlowRemovedCard({ flow }: Props) {
  return (
    <div className="space-y-4 text-sm text-muted-foreground">
      The flow <span className="font-medium">{flow.title}</span> has been{" "}
      <span className="font-medium text-red-500">removed</span>. While your grant wasn't explicitly
      removed, the parent flow is no longer active or paying out money.
    </div>
  )
}
