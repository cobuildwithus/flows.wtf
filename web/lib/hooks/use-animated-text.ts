"use client"

import { animate } from "framer-motion"
import { useEffect, useState } from "react"

export function useAnimatedText(text: string, split: "char" | "word" = "char", skip = false) {
  const [cursor, setCursor] = useState(0)
  const [startingCursor, setStartingCursor] = useState(0)
  const [prevText, setPrevText] = useState(text)

  const delimiter = split === "char" ? "" : " "

  if (prevText !== text) {
    setPrevText(text)
    setStartingCursor(text.startsWith(prevText) ? cursor : 0)
  }

  useEffect(() => {
    if (skip) return
    const controls = animate(startingCursor, text.split(delimiter).length, {
      duration: 4,
      ease: "easeOut",
      onUpdate(latest) {
        setCursor(Math.floor(latest))
      },
    })

    return () => controls.stop()
  }, [startingCursor, text, delimiter, skip])

  if (skip) return text
  return text.split(delimiter).slice(0, cursor).join(delimiter)
}
