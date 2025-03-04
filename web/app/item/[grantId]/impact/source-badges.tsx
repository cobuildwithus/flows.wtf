"use client"

import React, { useState } from "react"
import Image from "next/image"
import FarcasterLogo from "@/public/farcaster.svg"

interface Source {
  url: string
  image?: string
}

interface SourceBadgesProps {
  sources: Source[]
  maxVisible?: number
}

export default function SourceBadges({ sources, maxVisible = 4 }: SourceBadgesProps) {
  // Hold state to track whether the list is expanded or not.
  const [expanded, setExpanded] = useState(false)

  // If not expanded, only slice the sources to maxVisible.
  const displaySources = expanded ? sources : sources.slice(0, maxVisible)
  // Calculate the remaining sources only if not expanded.
  const remainingSources = expanded ? 0 : sources.length - maxVisible

  return (
    <div className="flex-0 inline-flex items-center rounded-lg border p-3">
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
                    width={12}
                    height={12}
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
          className="ml-2 text-xs font-medium text-gray-600 focus:outline-none"
        >
          +{remainingSources} more
        </button>
      )}
    </div>
  )
}
