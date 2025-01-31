"use client"

import Link from "next/link"
import Image from "next/image"
import { getIpfsUrl } from "@/lib/utils"
import { CommandItem, CommandSection } from "./command-sections"

interface Props {
  isLoading: boolean
  results?: {
    grant?: Array<{
      id: string
      data?: {
        id: string
        title: string
        image?: string
      }
    }>
  }
}

export function ResultSection({ isLoading, results }: Props) {
  return (
    <CommandSection title="Grants">
      {isLoading ? (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">Searching...</div>
      ) : results?.grant?.length ? (
        results.grant.map((result) => (
          <Link key={result.id} href={`/item/${result.data?.id}`}>
            <CommandItem
              icon={
                result.data?.image && (
                  <Image
                    src={getIpfsUrl(result.data?.image)}
                    alt=""
                    width={20}
                    height={20}
                    className="size-5 rounded-sm object-cover"
                  />
                )
              }
              text={result.data?.title || result.id}
            />
          </Link>
        ))
      ) : (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          {isLoading ? "Searching..." : "No grants found"}
        </div>
      )}
    </CommandSection>
  )
}
