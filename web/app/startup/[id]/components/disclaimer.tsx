"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface Props {
  startupTitle: string
}

export function Disclaimer({ startupTitle }: Props) {
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  return (
    <div className="mt-4 border-t pt-4">
      <button
        type="button"
        onClick={() => setShowDisclaimer(!showDisclaimer)}
        className="flex w-full items-center justify-between text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>Important info</span>
        {showDisclaimer ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {showDisclaimer && (
        <div className="mt-3 space-y-2 text-xs text-muted-foreground">
          <p className="leading-relaxed">
            • Tokens do not represent equity or ownership in {startupTitle}
          </p>
          <p className="leading-relaxed">
            • No financial returns, income, or yield are promised or implied
          </p>
          <p className="leading-relaxed">
            • Tokens function as digital support for the project, not as securities or investments
          </p>
          <p className="leading-relaxed">
            • Standard trading laws apply - insider trading is illegal
          </p>
        </div>
      )}
    </div>
  )
}
