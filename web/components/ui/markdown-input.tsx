"use client"

import { CSSProperties, useState } from "react"
import { Textarea } from "./textarea"

interface Props {
  name: string
  initialValue?: string
  minHeight?: CSSProperties["minHeight"]
  className?: string
}

export const MarkdownInput = (props: Props) => {
  const { name, initialValue, minHeight = 320, className = "" } = props
  const [markdown, setMarkdown] = useState(initialValue)

  return (
    <Textarea
      name={name}
      value={markdown}
      onChange={(e) => setMarkdown(e.target.value)}
      placeholder="Write markdown..."
      className={className}
      style={{ minHeight }}
    />
  )
}
