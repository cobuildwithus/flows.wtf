import { Impact } from "@prisma/flows"
import { Markdown } from "@/components/ui/markdown"
import Image from "next/image"
import { DateTime } from "@/components/ui/date-time"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Props {
  impact: Impact
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
}

export function ImpactContent(props: Props) {
  const { impact, onPrevious, onNext, hasPrevious, hasNext } = props
  const { name, bestImage, outcomes, date, images } = impact

  return (
    <div>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-medium md:text-2xl">{name}</h1>
        <div className="text-sm text-muted-foreground">
          <DateTime date={date} relative className="" /> • Rio De Janeiro, Brazil
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-12">
        <div className="md:col-span-3">
          <div className="mt-1.5 grid grid-cols-4 gap-1.5">
            {bestImage?.horizontal && (
              <Image
                src={bestImage.horizontal.raw}
                alt={name}
                width={768}
                height={512}
                className="col-span-3 row-span-2 size-full rounded object-cover"
              />
            )}
            {images?.map((image) => (
              <Image
                key={image.url}
                src={image.url}
                alt={name}
                width={240}
                height={240}
                className="aspect-square rounded object-cover"
              />
            ))}
          </div>
        </div>

        {outcomes?.length > 0 && (
          <div className="md:col-span-2">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">Outcomes</h2>
            <ul className="space-y-3">
              {outcomes.map((outcome, index) => (
                <li key={index} className="flex items-start text-sm">
                  <span className="mr-3 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {index + 1}
                  </span>
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
