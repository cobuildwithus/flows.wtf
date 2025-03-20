import { DateTime } from "@/components/ui/date-time"
import type { Impact } from "@prisma/flows"
import Image from "next/image"
import SourceBadges from "./source-badges"
import { ImpactMedia } from "./impact-media"
import { ImpactUpdates } from "./impact-updates"
import { ImpactMetrics } from "./impact-metrics"
import { PeopleSection } from "./people-involved"
import { ResultsSection } from "./results"

interface Props {
  impact: Impact
}

export function ImpactContent(props: Props) {
  const { impact } = props
  const { name, date, impactMetrics, bestImage, peopleInvolved, proofs } = impact

  const hasImpactMetrics = impactMetrics.some(({ name }) => name.toLowerCase() !== "noggles")
  const hasMedia = impactHasMedia(impact)

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
      <div className="relative grid grid-cols-1 items-start gap-12 max-md:gap-y-8 max-md:p-5 md:grid-cols-12">
        <div className="max-md:order-last md:col-span-6">
          <h3 className="pb-4 text-xs font-medium uppercase tracking-wide opacity-85 md:hidden">
            {hasMedia ? "Media" : "Proof"}
          </h3>
          {hasMedia ? (
            <ImpactMedia impact={impact} name={name} />
          ) : (
            <ImpactUpdates impact={impact} />
          )}
        </div>

        <aside className="md:col-span-6 md:mt-12 md:pr-20">
          <header>
            <DateTime
              date={date}
              relative
              className="mt-1 text-sm text-muted-foreground md:hidden"
            />
          </header>

          <section className="max-md:mt-4">
            <ResultsSection impact={impact} />
          </section>

          {hasImpactMetrics && <ImpactMetrics impact={impact} />}

          {peopleInvolved.length > 0 && (
            <section className="mt-8">
              <PeopleSection peopleInvolved={peopleInvolved} />
            </section>
          )}
          <section className="mt-8">
            <h3 className="text-xs font-medium uppercase tracking-wide opacity-85">Sources</h3>
            <div className="mt-4">
              <SourceBadges
                sources={proofs.map((proof) => ({
                  url: proof.url,
                  image: proof.images[0]?.url,
                }))}
              />
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}

function impactHasMedia(impact: Impact) {
  return impact.proofs.some((proof) => proof.images.length > 0 || proof.videos.length > 0)
}
