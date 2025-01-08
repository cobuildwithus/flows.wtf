"use client"

interface Props {
  canEdit: boolean
}

export function StoryIncomplete({ canEdit }: Props) {
  return (
    <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50/50 px-4 py-2 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200">
      {canEdit ? (
        <span>This story is incomplete. Chat below to talk to the journalist.</span>
      ) : (
        <span>This story is still being written. Check back later for updates.</span>
      )}
    </div>
  )
}
