"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { HamburgerMenuIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { useSelectedLayoutSegments } from "next/navigation"
import { useState } from "react"

const publicOptions = [
  { name: "Flows", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Impact", href: "/impact" },
  { name: "Apply", href: "/apply" },
  { name: "Curate", href: "/curate" },
  {
    name: "Search",
    href: "?search",
    icon: <MagnifyingGlassIcon className="size-5" />,
    mobileOnly: true,
  },
] as { name: string; href: string; icon?: React.ReactNode; mobileOnly?: boolean }[]

export function MenuMobile() {
  const [open, setOpen] = useState(false)
  const menu = useMenu()

  return (
    <div className="lg:hidden">
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="hidden">
          <DialogTitle>Menu</DialogTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <HamburgerMenuIcon className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <DialogContent className="h-full rounded-t-xl p-0 sm:max-w-none">
          <div className="flex flex-col justify-end gap-1 p-4 pt-12">
            {menu.map(({ name, href, isCurrent, icon }) => (
              <Link
                key={name}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex h-10 items-center justify-between rounded-md px-4 text-lg font-medium transition-colors",
                  {
                    "bg-primary text-primary-foreground": isCurrent,
                    "hover:bg-accent": !isCurrent,
                  },
                )}
              >
                <span>{name}</span>
                {icon}
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function MenuDesktop() {
  const menu = useMenu()

  return (
    <nav className="hidden lg:flex lg:grow lg:flex-row lg:justify-center lg:space-x-8">
      {menu
        .filter(({ mobileOnly }) => !mobileOnly)
        .map(({ name, href, isCurrent, icon }) => (
          <Link
            key={name}
            href={href}
            className={cn(
              "underline-primary group flex items-center gap-1.5 px-1 font-medium tracking-tight underline-offset-8 md:text-lg",
              {
                "text-primary underline": isCurrent,
                "text-muted-foreground hover:text-foreground": !isCurrent,
              },
            )}
          >
            <span>{name}</span>
            {icon}
          </Link>
        ))}
    </nav>
  )
}

function useMenu() {
  const segments = useSelectedLayoutSegments()

  const options = [...publicOptions]

  return options.map((option) => {
    return {
      ...option,
      isCurrent: option.href === `/${segments[0] || ""}`,
    }
  })
}
