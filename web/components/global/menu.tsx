"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { HamburgerMenuIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { useSelectedLayoutSegments } from "next/navigation"

const options = [
  { name: "Flows", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Apply", href: "/apply" },
  { name: "About", href: "/about" },
  { name: "Curate", href: "/curate" },
] as const

export function MenuMobile() {
  const menu = useMenu()

  return (
    <div className="lg:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <HamburgerMenuIcon className="size-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {menu.map(({ name, href, isCurrent }) => (
            <DropdownMenuItem key={name} asChild>
              <Link
                href={href}
                className={cn("w-full px-2 py-1.5", {
                  "text-primary": isCurrent,
                  "text-muted-foreground hover:text-foreground": !isCurrent,
                })}
              >
                {name}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function MenuDesktop() {
  const menu = useMenu()

  return (
    <>
      <nav className="hidden lg:flex lg:grow lg:flex-row lg:justify-center lg:space-x-8">
        {menu.map(({ name, href, isCurrent }) => (
          <Link
            key={name}
            href={href}
            className={cn(
              "underline-primary group px-1 font-medium tracking-tight underline-offset-8",
              {
                "text-primary underline": isCurrent,
                "text-muted-foreground hover:text-foreground": !isCurrent,
              },
            )}
          >
            {name}
          </Link>
        ))}
      </nav>
    </>
  )
}

function useMenu() {
  const segments = useSelectedLayoutSegments()

  return options.map((option) => {
    return {
      ...option,
      isCurrent: option.href === `/${segments[0] || ""}`,
    }
  })
}
