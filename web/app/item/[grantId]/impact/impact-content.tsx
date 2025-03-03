import { DateTime } from "@/components/ui/date-time"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import Noggles from "@/public/noggles.svg"
import type { Impact } from "@prisma/flows"
import { CircleCheckBig } from "lucide-react"
import Image from "next/image"
import pluralize from "pluralize"
import SourceBadges from "./source-badges"

interface Props {
  impact: Impact
}

export function ImpactContent(props: Props) {
  const { impact } = props
  const { name, results, date, impactMetrics, bestImage, peopleInvolved, proofs } = impact

  const hasImpactMetrics = impactMetrics.some(({ name }) => name.toLowerCase() !== "noggles")
  const images = proofs.flatMap((proof) => {
    return proof.images.map((image) => ({
      ...image,
      proofUrl: proof.url,
    }))
  })

  return (
    <>
      <div className="sticky top-0 h-0 max-sm:hidden">
        <div className="absolute -right-8 top-8 z-30">
          <DateTime
            date={date}
            className="block rotate-45 bg-secondary px-12 py-0.5 text-sm font-medium text-primary"
            relative
            short
          />
        </div>
      </div>
      <Image
        src={bestImage.horizontal?.raw ?? bestImage.url}
        alt={name}
        width={640}
        height={360}
        className="aspect-video w-full rounded-b-lg object-cover md:hidden"
      />
      <div className="relative grid grid-cols-1 items-start gap-12 max-sm:gap-y-8 max-sm:p-5 md:grid-cols-12">
        <div className="max-sm:order-last md:col-span-6">
          <h3 className="pb-4 text-xs font-medium uppercase tracking-wide opacity-85 md:hidden">
            Media
          </h3>
          <div
            className={cn("grid grid-cols-2 gap-1.5", {
              "md:grid-cols-1": images.length < 3,
            })}
          >
            {images.map((image) => (
              <a
                href={image.proofUrl}
                target="_blank"
                rel="noreferrer"
                key={`${image.url}`}
                className="transition-opacity hover:opacity-80"
              >
                <Image
                  src={image.url}
                  alt={name}
                  width={330}
                  height={330}
                  className={cn("w-full object-cover max-sm:aspect-square max-sm:rounded-md", {
                    "md:aspect-square": images.length >= 3,
                  })}
                />
              </a>
            ))}
          </div>
        </div>

        <aside className="md:sticky md:top-12 md:col-span-6 md:pr-20">
          <header>
            <DateTime
              date={date}
              relative
              className="mt-1 text-sm text-muted-foreground md:hidden"
            />
          </header>

          <section className="flex flex-col gap-y-4 max-md:mt-4">
            <h3 className="text-xs font-medium uppercase tracking-wide opacity-85">Results</h3>
            <ul className="flex flex-col space-y-3">
              {results.map((result) => (
                <li key={result.headline} className="flex items-start">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex cursor-help items-center space-x-2.5 text-sm">
                        <CircleCheckBig className="size-4 text-green-400/75" />
                        <span className="font-light opacity-85">{result.headline}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs py-2">{result.details}</TooltipContent>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </section>

          {hasImpactMetrics && (
            <section className="mt-8">
              <h3 className="text-xs font-medium uppercase tracking-wide opacity-85">Impact</h3>
              <dl className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {impactMetrics
                  .filter(({ name }) => name.toLowerCase() !== "noggles")
                  .map((unit) => (
                    <div key={unit.name} className="rounded-md border p-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex h-full cursor-help flex-col items-start justify-start gap-y-2.5">
                            <dt className="text-xs text-muted-foreground">
                              {unit.units === "⌐◨-◨" ? (
                                <Image src={Noggles} alt="Noggles" height={12} />
                              ) : (
                                pluralize(unit.units, Number.parseInt(unit.value))
                              )}
                            </dt>
                            <dd className="order-first text-3xl font-bold tracking-tight">
                              {unit.value}
                            </dd>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs py-2">
                          {unit.description}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
              </dl>
            </section>
          )}

          {peopleInvolved.length > 0 && (
            <section className="mt-8">
              <h3 className="flex items-center text-xs font-medium uppercase tracking-wide opacity-85">
                People{" "}
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1">
                  {peopleInvolved.length}
                </span>
              </h3>
              <div className="mt-4 grid grid-cols-8 gap-2.5">
                {peopleInvolved.map((person) => (
                  <div
                    key={`${person.userId}`}
                    className="flex size-full items-center space-x-2.5 overflow-hidden rounded-full text-sm"
                  >
                    <Image
                      src={person.headshotUrl}
                      alt="Person"
                      width={108}
                      height={108}
                      className="size-full scale-[1.2] rounded-full"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
          <section className="mt-8">
            <h3 className="text-xs font-medium uppercase tracking-wide opacity-85">Sources</h3>
            <div className="mt-4">
              <SourceBadges
                sources={proofs.map((proof) => ({
                  url: proof.url,
                  image: proof.images[0].url,
                }))}
              />
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}
