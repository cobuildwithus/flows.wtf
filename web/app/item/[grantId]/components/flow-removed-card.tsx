import "server-only"

import type { Grant } from "@prisma/flows"

interface Props {
  flow: Grant
}

export function FlowRemovedCard({ flow }: Props) {
  return (
    <div className="space-y-4 text-sm text-muted-foreground">
      The <span className="font-medium">{flow.title}</span> flow has been{" "}
      <span className="font-medium text-red-500">removed</span>. While your grant wasn&apos;t
      explicitly removed, the parent flow is unfortunately no longer active or paying out money.
    </div>
  )
}
