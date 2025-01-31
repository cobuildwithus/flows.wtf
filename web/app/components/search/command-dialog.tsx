"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useSearchEmbeddings } from "./use-search-embeddings"
import { DialogTitle } from "@radix-ui/react-dialog"
import { ResultSection } from "./result-section"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

interface Props {
  identityToken?: string
}

const CommandPalette = ({ identityToken }: Props) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const hasSearched = debouncedSearch.length > 0
  const router = useRouter()
  const searchParams = useSearchParams()

  const { results, isLoading } = useSearchEmbeddings(
    {
      query: debouncedSearch,
      types: ["grant"],
      numResults: 7,
    },
    identityToken,
  )

  // Check URL for search param on mount
  useEffect(() => {
    if (searchParams.has("search")) {
      setOpen(true)
    }
  }, [searchParams])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)

    return () => clearTimeout(timer)
  }, [search])

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

  if (!identityToken) {
    return null
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
      <DialogContent className="!rounded-2xl p-0 sm:max-w-[550px] [&>button]:hidden">
        <div className="hidden">
          <DialogTitle>Search</DialogTitle>
        </div>
        <div className={cn("relative border-border px-1 py-0.5", hasSearched && "border-b")}>
          <Input
            className="h-12 border-0 text-lg focus-visible:ring-0"
            placeholder="What do you need?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <EscapeKeyDisplay />
        </div>
        {hasSearched && (
          <div className="px-3 pb-3">
            <ResultSection isLoading={isLoading} results={results} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function EscapeKeyDisplay() {
  return (
    <kbd className="pointer-events-none absolute right-3 top-[50%] inline-flex h-6 -translate-y-[50%] select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100">
      <span className="text-xs">Esc</span>
    </kbd>
  )
}

export default CommandPalette
