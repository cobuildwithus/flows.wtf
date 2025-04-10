"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn, getIpfsUrl } from "@/lib/utils"
import { Command, useCommandState } from "cmdk"
import { useRouter, useSearchParams } from "next/navigation"
import { useDeferredValue, useEffect, useState } from "react"
import { useSearchEmbeddings } from "./use-search-embeddings"

export default function CommandPalette() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)
  const [open, setOpen] = useState(false)
  const hasSearched = deferredQuery.length > 0
  const searchParams = useSearchParams()

  const { results, isLoading } = useSearchEmbeddings(
    { query: deferredQuery, types: ["grant"], numResults: 7 },
    !open,
  )

  const grants = results?.grant ?? []

  const showEmpty = !isLoading && query && grants.length === 0

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Check URL for search param on mount
  useEffect(() => {
    if (searchParams.has("search")) {
      setOpen(true)
    }
  }, [searchParams])

  const handleSelect = (path: string) => {
    router.push(path)
    setOpen(false)
  }

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      const url = new URL(window.location.href)
      url.searchParams.delete("search")
      router.replace(url.pathname + url.search)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[96vw] overflow-hidden !rounded-2xl p-0 sm:max-w-[550px] [&>button]:hidden">
        <DialogTitle className="hidden">What do you need?</DialogTitle>
        <Command shouldFilter={false} loop className="overflow-hidden">
          <div className={cn("relative border-border px-1 py-0.5", hasSearched && "border-b")}>
            <Command.Input
              placeholder="What do you need?"
              value={query}
              onValueChange={setQuery}
              className="relative flex h-12 w-full items-center rounded-md border-0 px-4 py-2 text-lg outline-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
              maxLength={40}
            />
            <EscapeKeyDisplay />
          </div>
          {hasSearched && (
            <Command.List className="max-h-[300px] overflow-y-auto p-2">
              {showEmpty && <EmptyResults />}

              {!isLoading && grants.length > 0 && (
                <Command.Group
                  heading="Grants"
                  className="text-xs font-semibold text-muted-foreground [&>*:first-child]:mb-2"
                >
                  {grants.map((result) => (
                    <Command.Item
                      key={result.id}
                      value={result.id}
                      onSelect={() => handleSelect(`/item/${result.data?.id}`)}
                      className="relative flex select-none items-center rounded-sm px-3 py-2 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                    >
                      <div className="flex flex-1 items-center gap-3">
                        {result.data?.image && (
                          <div className="shrink-0">
                            <Image
                              src={getIpfsUrl(result.data.image)}
                              alt={result.data?.title || result.id}
                              width={20}
                              height={20}
                              className="size-5 rounded-sm object-cover"
                            />
                          </div>
                        )}
                        <span className="line-clamp-1">{result.data?.title || result.id}</span>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {isLoading && (
                <Command.Loading className="px-2 py-1.5 text-sm text-muted-foreground">
                  Searching...
                </Command.Loading>
              )}
            </Command.List>
          )}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function EscapeKeyDisplay() {
  return (
    <kbd className="pointer-events-none absolute right-3 top-[50%] inline-flex h-6 -translate-y-[50%] select-none items-center gap-1 rounded border px-1.5 text-[10px] font-medium">
      <span className="text-xs">Esc</span>
    </kbd>
  )
}

function EmptyResults() {
  const search = useCommandState((state) => state.search)

  return (
    <Command.Empty className="px-2 py-1.5 text-sm text-muted-foreground">
      {search ? `No results found for "${search}"` : "No results found."}
    </Command.Empty>
  )
}
