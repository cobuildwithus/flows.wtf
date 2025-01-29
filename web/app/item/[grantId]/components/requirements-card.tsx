"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { getScoreColor } from "./score-color"
import { CircularProgress } from "./circular-progress"
import React from "react"

interface Props {
  title: string
  score: number
  explanation: string
  tips?: string[]
}

export function RequirementsCard({ title, score, explanation, tips }: Props) {
  return (
    <Card className="flex w-full flex-col">
      <div className="flex flex-row items-center justify-between gap-3 px-6 py-3 pb-2 text-left text-base font-medium md:px-3.5">
        {title}
        <CircularProgress size={8} value={score} />
      </div>

      <div className="flex flex-col space-y-3 p-3.5 pt-0 md:p-4 md:pt-0">
        <CardDescription className="text-xs">{explanation}</CardDescription>
        {tips && tips.length > 0 && (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              <AlertCircle className="h-3 w-3" />
              Tips
            </div>
            <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
              {tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  )
}
