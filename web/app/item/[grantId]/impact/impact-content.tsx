import { DateTime } from "@/components/ui/date-time"
import { Impact } from "@prisma/flows"
import Image from "next/image"

interface Props {
  impact: Impact
}

export function ImpactContent(props: Props) {
  const { impact } = props
  const { name, bestImage, outcomes, date, images } = impact

  return (
    <div>
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-bold tracking-tight md:text-2xl">{name}</h1>
          <div className="text-sm text-muted-foreground md:text-base">Rio De Janeiro, Brazil</div>
        </div>
        <DateTime
          date={date}
          className="text-sm text-muted-foreground md:text-base"
          locale="en-US"
          options={{ year: "numeric", month: "numeric", day: "numeric", formatMatcher: "basic" }}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-12">
        <div className="md:col-span-3">
          <div className="mt-1.5 grid grid-cols-3 gap-1.5 md:grid-cols-4">
            {bestImage?.horizontal && (
              <Image
                src={bestImage.horizontal.raw}
                alt={name}
                width={768}
                height={512}
                className="col-span-2 row-span-2 size-full rounded object-cover md:col-span-3"
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
