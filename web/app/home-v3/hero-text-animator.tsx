"use client"

import { useEffect, useState } from "react"

const projects = [
  "Software startup",
  "AI venture",
  "Hardware business",
  "Open Source library",
  "Crypto venture",
  "Community",
  "Sports brand",
  "Art collective",
  "Tech venture",
  "Health business",
  "Charity initiative",
  "Nature venture",
  "Gaming studio",
  "Education business",
  "Finance venture",
  "Music label",
  "Film studio",
  "Fashion brand",
  "Food business",
  "Travel venture",
  "Fitness brand",
  "Science research",
]

export function HeroTextAnimator() {
  const [currentWord, setCurrentWord] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [text, setText] = useState("")
  const [delta, setDelta] = useState(200)

  useEffect(() => {
    const ticker = setInterval(() => {
      tick()
    }, delta)

    return () => clearInterval(ticker)
  }, [text, isDeleting, currentWord, delta])

  const tick = () => {
    const fullText = projects[currentWord]
    const updatedText = isDeleting
      ? fullText.substring(0, text.length - 1)
      : fullText.substring(0, text.length + 1)

    setText(updatedText)

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true)
      setDelta(2000) // Pause before deleting
    } else if (isDeleting && updatedText === "") {
      setIsDeleting(false)
      setCurrentWord((prev) => (prev + 1) % projects.length)
      setDelta(200)
    } else {
      setDelta(isDeleting ? 50 : 100)
    }
  }

  return (
    <span className="inline-block w-full overflow-visible bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text pb-2 text-transparent sm:w-auto sm:leading-normal">
      {text || "\u00A0"}
    </span>
  )
}
