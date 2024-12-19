"use client"

import { ActiveCuratorGrantRow } from "./curator-grant-row"
import { ActiveCuratorGrant } from "./hooks/get-user-tcr-tokens"

interface ActiveCuratorGrantsProps {
  grants: ActiveCuratorGrant[]
  closePopover: () => void
}

export function CuratorGrants(props: ActiveCuratorGrantsProps) {
  const { grants, closePopover } = props

  if (grants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-gray-200/30 py-6 text-sm text-muted-foreground dark:bg-gray-800">
        <p className="px-4">No pending grants. Keep up the great work!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {grants
        .sort((a, b) => a.challengePeriodEndsAt - b.challengePeriodEndsAt)
        .map((grant) => (
          <ActiveCuratorGrantRow closePopover={closePopover} key={grant.title} grant={grant} />
        ))}
    </div>
  )
}
