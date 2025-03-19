"use client"

import FarcasterLogo from "@/public/farcaster.svg"
import Image from "next/image"
import { useState } from "react"

interface Props {
  sources: { url: string; image?: string }[]
  maxVisible?: number
}

export default function BlockSources({ sources, maxVisible = 4 }: Props) {
  const [expanded, setExpanded] = useState(false)

  const displaySources = expanded ? sources : sources.slice(0, maxVisible)
  const remainingSources = expanded ? 0 : sources.length - maxVisible

  return (
    <section className="mt-8">
      <h3 className="text-xs font-medium uppercase tracking-wide opacity-85">Sources</h3>
      <div className="flex-0 mt-4 inline-flex items-center">
        <div className="flex -space-x-2">
          {displaySources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block"
            >
              {source.image ? (
                <div className="h-7 w-7 overflow-hidden rounded-full border-2 border-white shadow-sm">
                  <Image
                    src={source.image}
                    alt="Source logo"
                    width={28}
                    height={28}
                    className="h-full w-full object-cover blur-[1px]"
                  />
                </div>
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-300 text-xs font-medium shadow-sm">
                  {source.url
                    .replace(/^https?:\/\//, "")
                    .split(".")[0]
                    .charAt(0)
                    .toUpperCase()}
                  {source.url.startsWith("https://warpcast.com") && (
                    <Image
                      src={FarcasterLogo}
                      alt="Farcaster"
                      className="absolute inset-0 m-auto h-5 text-white opacity-90"
                      width={20}
                      height={20}
                    />
                  )}
                </div>
              )}
            </a>
          ))}
        </div>

        {/* Only show the +X more button if there are remaining sources and the list is not already expanded */}
        {!expanded && remainingSources > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="ml-2 text-xs font-medium opacity-70 focus:outline-none"
          >
            +{remainingSources} more
          </button>
        )}
      </div>
    </section>
  )
}
