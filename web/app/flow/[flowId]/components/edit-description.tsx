"use client"

import { useState } from "react"
import { Markdown } from "@/components/ui/markdown"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useSetDescription } from "../hooks/useSetDescription"
import { useRouter } from "next/navigation"

interface Props {
  initial: string
  contract: `0x${string}`
  chainId: number
  canEdit: boolean
}

export function EditDescription({ initial, contract, chainId, canEdit }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initial)
  const router = useRouter()
  const { setDescription, isLoading } = useSetDescription({
    contract,
    chainId,
    onSuccess: () => {
      setIsEditing(false)
      router.refresh()
    },
  })

  if (!canEdit) {
    return <Markdown>{initial}</Markdown>
  }

  if (!isEditing) {
    return (
      <div className="space-y-2">
        <Markdown>{initial}</Markdown>
        <Button variant="outline" size="sm" type="button" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="min-h-[320px]"
      />
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => {
            setIsEditing(false)
            setValue(initial)
          }}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          loading={isLoading}
          disabled={isLoading}
          type="button"
          onClick={() => setDescription(value)}
        >
          Save
        </Button>
      </div>
    </div>
  )
}
