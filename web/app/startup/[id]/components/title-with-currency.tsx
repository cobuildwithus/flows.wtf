import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"

import Link from "next/link"

interface Props {
  title: string
  href?: string
  value?: number
  flowRate?: number
}
export function TitleWithCurrency({ title, href, value, flowRate }: Props) {
  return (
    <div className="flex w-full items-center justify-between gap-1 text-base">
      {href ? (
        <Link href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {title}
        </Link>
      ) : (
        <span>{title}</span>
      )}
      {value && (
        <Badge className="text-sm" variant="secondary">
          <Currency>{value}</Currency>
        </Badge>
      )}
      {flowRate && (
        <Badge className="text-sm" variant="secondary">
          <Currency>{flowRate}</Currency>/mo
        </Badge>
      )}
    </div>
  )
}
