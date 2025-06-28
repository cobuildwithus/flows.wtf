import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"

import Link from "next/link"

interface Props {
  title: string
  flowId: string
  monthlyFlowRate: number
}

export function TitleWithFlowRate({ title, flowId, monthlyFlowRate }: Props) {
  return (
    <div className="flex w-full items-center justify-between gap-1 text-base">
      <Link
        href={`/flow/${flowId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        {title}
      </Link>
      <Badge className="text-sm" variant="secondary">
        <Currency>{monthlyFlowRate}</Currency>/mo
      </Badge>
    </div>
  )
}
