"use client"

import { Button } from "@/components/ui/button"

interface FundingBannerProps {
  link?: string
}

export function FundingBanner({
  link = "https://www.nouns.camp/proposals/785",
}: FundingBannerProps) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      style={{ textDecoration: "none" }}
    >
      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
        <span>
          <span className="hidden sm:inline">Flows needs funding. Click to support our prop.</span>
          <span className="inline text-xs sm:hidden">Flows is dry - please support our prop.</span>
        </span>
      </div>
    </a>
  )
}
