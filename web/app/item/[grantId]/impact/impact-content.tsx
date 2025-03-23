"use client"

import { DateTime } from "@/components/ui/date-time"
import type { Impact } from "@prisma/flows"
import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"
import { BlockChat } from "./content/block-chat"
import { BlockEdit } from "./content/block-edit"
import { BlockMetrics } from "./content/block-metrics"
import { BlockPeople } from "./content/block-people"
import { BlockProofs } from "./content/block-proofs"
import { BlockResults } from "./content/block-results"
import BlockSources from "./content/block-sources"
import { cn } from "@/lib/utils"

interface Props {
  impact: Impact
  canEdit: boolean
}

export function ImpactContent(props: Props) {
  const { impact, canEdit } = props
  const { name, results, date, bestImage, peopleInvolved, proofs, impactMetrics } = impact

  const [isEditing, setIsEditing] = useState(false)

  return (
    <>
      <div className="sticky top-0 h-0 max-sm:hidden">
        <div className="absolute -right-8 top-8 z-30">
          <DateTime
            date={date}
            className="block rotate-45 bg-primary px-12 py-0.5 text-sm font-medium text-primary-foreground"
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
      <div className="relative grid min-h-[70vh] grid-cols-1 items-start gap-10 max-md:gap-y-8 max-md:p-5 md:grid-cols-12">
        <div
          className={cn("relative max-md:order-last md:col-span-7", {
            "min-h-[75vh] max-md:-m-5 max-md:min-h-[85dvh]": isEditing,
          })}
        >
          <motion.div
            variants={{
              hidden: { maxHeight: "calc(80vh - 2px)", overflow: "hidden" },
              visible: { maxHeight: "auto", overflow: "visible" },
            }}
            animate={isEditing ? "hidden" : "visible"}
            initial="visible"
          >
            <BlockProofs
              impactId={impact.id}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              proofs={proofs}
              name={name}
            />
          </motion.div>
          {isEditing && <BlockChat impact={impact} />}
        </div>

        <aside className="md:sticky md:top-10 md:col-span-5 md:pr-20">
          <header className="md:hidden">
            <DateTime date={date} relative className="mt-1 text-sm text-muted-foreground" />
          </header>

          <BlockResults results={results} />

          <BlockMetrics
            impactMetrics={impactMetrics}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            impactId={impact.id}
          />

          <BlockPeople peopleInvolved={peopleInvolved} />

          <BlockSources
            sources={proofs.map((proof) => ({ url: proof.url, image: proof.images[0]?.url }))}
          />

          {canEdit && (
            <BlockEdit isEditing={isEditing} setIsEditing={setIsEditing} impactId={impact.id} />
          )}
        </aside>
      </div>
    </>
  )
}
