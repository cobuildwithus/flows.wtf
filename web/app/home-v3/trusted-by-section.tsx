"use client"

import Image from "next/image"
import Link from "next/link"
import { getIpfsUrl } from "@/lib/utils"
import { useRef } from "react"
import { AnimatedSalary } from "@/components/global/animated-salary"
import { VRBS_GRANTS_PAYOUTS, REWARD_POOL_PAYOUT } from "@/lib/home-v3/old-grants-data"

interface TrustedBySectionProps {
  topLevelFlows: Array<{
    id: string
    title: string
    description: string
    image: string
    tagline: string | null
    totalPaidOut: string
    activeRecipientCount: number
    monthlyOutgoingFlowRate: string
    underlyingTokenSymbol: string
    underlyingTokenPrefix: string
  }>
}

export function TrustedBySection({ topLevelFlows }: TrustedBySectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (topLevelFlows.length === 0) return null

  // Duplicate the array to create seamless infinite scroll
  const duplicatedFlows = [...topLevelFlows, ...topLevelFlows].filter(
    (flow) => !FLOWS_TO_FILTER.includes(flow.id),
  )

  const handleMouseEnter = () => {
    if (scrollRef.current) {
      scrollRef.current.style.animationPlayState = "paused"
    }
  }

  const handleMouseLeave = () => {
    if (scrollRef.current) {
      scrollRef.current.style.animationPlayState = "running"
    }
  }

  return (
    <section className="mt-12 overflow-hidden bg-muted/80 py-16 dark:bg-black/20">
      <div className="container mb-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Trusted by</h2>
          <p className="mt-3 hidden text-muted-foreground md:block">
            Leading orgs use Flows to fund what matters to them
          </p>
        </div>
      </div>

      <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {/* Scrolling container */}
        <div className="overflow-hidden">
          <div
            ref={scrollRef}
            className="flex animate-infinite-scroll gap-6 px-6"
            style={{ width: "max-content" }}
          >
            {duplicatedFlows.map((flow, index) => (
              <Link
                href={`/flow/${flow.id}`}
                key={`${flow.id}-${index}`}
                className="group block flex-shrink-0"
              >
                <div className="h-full w-64 transition-all duration-200 md:w-80">
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <Image
                        src={getFlowImage(flow)}
                        alt={flow.title}
                        width={64}
                        height={64}
                        className="size-16 shrink-0 rounded-full object-cover ring-1 ring-border"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-semibold transition-colors group-hover:text-primary">
                          {cleanFlowTitle(flow.title)}
                        </h3>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                          <div>
                            <AnimatedSalary
                              value={getTotalPaidOut(flow)}
                              monthlyRate={Number(flow.monthlyOutgoingFlowRate)}
                              grant={{
                                underlyingTokenSymbol: flow.underlyingTokenSymbol,
                                underlyingTokenPrefix: flow.underlyingTokenPrefix,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const FLOWS_TO_FILTER = ["0x5a0b34e575c46b657d0dba5c87f74380987204c8"]

function cleanFlowTitle(title: string): string {
  return title.replace(/ Flow$/, "")
}

const getFlowImage = (flow: { id: string; image: string }) => {
  if (flow.id === "0x0d4a25d07015ec7bdebf78f2937a617a86af27ff") {
    return "/nouns.jpg"
  }
  if (flow.id === "0x4d491999f8fb73289eef3a696414dca3a994dc1b") {
    return "/revnet.png"
  }
  return getIpfsUrl(flow.image)
}

const getTotalPaidOut = (flow: { id: string; totalPaidOut: string }) => {
  let totalPaidOut = Number(flow.totalPaidOut)

  // Add old grants data for specific flows
  if (flow.id === "0x0d4a25d07015ec7bdebf78f2937a617a86af27ff") {
    // Nouns - add reward pool payout
    totalPaidOut += REWARD_POOL_PAYOUT
  } else if (flow.id === "0x69214d34ad19d09349be339d6339aef84eb73136") {
    // Vrbs - add vrbs grants payouts
    totalPaidOut += VRBS_GRANTS_PAYOUTS
  }

  return totalPaidOut
}
