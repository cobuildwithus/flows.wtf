"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { AlertCircle } from "lucide-react"

function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-500 dark:bg-green-400"
  if (score >= 60) return "bg-yellow-500 dark:bg-yellow-400"
  return "bg-red-500 dark:bg-red-400"
}

export function MetricCard({
  title,
  score,
  explanation,
  tips,
}: {
  title: string
  score: number
  explanation: string
  tips?: string[]
}) {
  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader className="flex flex-col space-y-3">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <span
            className={`text-2xl font-bold ${
              score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500"
            }`}
          >
            {score}
          </span>
        </div>
        <Progress value={score} className="h-2" indicatorClassName={getScoreColor(score)} />
      </CardHeader>
      <CardContent className="flex flex-grow flex-col justify-between space-y-3 md:pt-4">
        <CardDescription className="text-sm">{explanation}</CardDescription>
        {tips && tips.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger
              tabIndex={-1}
              className="flex w-full items-center gap-2 text-sm font-medium"
            >
              <AlertCircle className="h-4 w-4" />
              Tips for Improvement
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  )
}
