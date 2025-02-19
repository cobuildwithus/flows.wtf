import { DateTime } from "@/components/ui/date-time"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Impact } from "@prisma/flows"
import { CircleCheckBig } from "lucide-react"
import Image from "next/image"

interface Props {
  impact: Impact
}

export function ImpactContent(props: Props) {
  const { impact } = props
  const { name, outcomes, date, impactUnits, bestImage, peopleInvolved, proofs } = impact

  return (
    <>
      <div className="sticky top-0 h-0 max-sm:hidden">
        <div className="absolute -right-8 top-8 z-30">
          <DateTime
            date={date}
            className="block rotate-45 bg-primary px-10 py-0.5 text-sm font-medium text-primary-foreground"
            options={{ year: "numeric", month: "numeric", day: "numeric", formatMatcher: "basic" }}
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
      <div className="relative grid grid-cols-1 items-start max-sm:gap-y-8 max-sm:p-5 md:grid-cols-12">
        <div className="max-sm:order-last md:col-span-7">
          <h3 className="pb-4 text-xs font-medium uppercase tracking-wide opacity-85 md:hidden">
            Media
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {proofs.map((proof) =>
              proof.images.map((image) => (
                <a
                  href={proof.url}
                  target="_blank"
                  key={`${image.url}`}
                  className="transition-opacity hover:opacity-80"
                >
                  <Image
                    src={image.url}
                    alt={name}
                    width={330}
                    height={330}
                    className="aspect-square w-full object-cover max-sm:rounded-md"
                  />
                </a>
              )),
            )}
          </div>
        </div>

        <aside className="md:sticky md:top-8 md:col-span-5 md:pl-8 md:pr-4">
          <header>
            <h1 className="text-lg font-bold tracking-tight md:pr-16 md:text-2xl">{name}</h1>
            <DateTime
              date={date}
              className="mt-1 text-sm text-muted-foreground md:hidden"
              options={{
                year: "numeric",
                month: "numeric",
                day: "numeric",
                formatMatcher: "basic",
              }}
            />
          </header>

          <section className="mt-6">
            <ul className="space-y-3">
              {outcomes.map((outcome, index) => (
                <li key={index} className="flex items-center space-x-2.5 text-sm">
                  <CircleCheckBig className="size-4 text-green-400/75" />
                  <span className="font-light opacity-85">{outcome}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h3 className="text-xs font-medium uppercase tracking-wide opacity-85">Impact</h3>
            <dl className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {impactUnits.map((unit) => (
                <div key={unit.name} className="rounded-md border p-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex cursor-default flex-col items-start gap-y-2.5">
                        <dt className="text-xs text-muted-foreground">{unit.name}</dt>
                        <dd className="order-first text-3xl font-bold tracking-tight">
                          {unit.value}
                        </dd>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">{unit.description}</TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-10">
            <h3 className="text-xs font-medium uppercase tracking-wide opacity-85">People</h3>
            <div className="mt-4 grid grid-cols-8 gap-2.5">
              {peopleInvolved.map((person) => (
                <div key={`${person.userId}`} className="flex items-center space-x-2.5 text-sm">
                  <Image
                    src={person.headshotUrl}
                    alt="Person"
                    width={32}
                    height={32}
                    className="size-full rounded-full"
                  />
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}
