import { CuratorPopover } from "@/components/global/curator-popover/curator-popover"
import { MenuDesktop, MenuMobile } from "@/components/global/menu"
import { MenuAvatar } from "@/components/global/menu-avatar"
import { RecipientPopover } from "@/components/global/recipient-popover/recipient-popover"
import { RefreshOnFocus } from "@/components/global/refresh-on-focus"
import { ThemeProvider } from "@/components/global/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { getUser, hasSession } from "@/lib/auth/user"
import { getPool } from "@/lib/database/queries/pool"
import { isProduction } from "@/lib/utils"
import Wagmi from "@/lib/wagmi/wagmi-provider"
import Noggles from "@/public/noggles.svg"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"
import { Roboto_Mono } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import "./globals.css"
import CommandPalette from "./components/search/command-dialog"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { PromptFarcasterSignup } from "@/components/global/prompt-farcaster-signup"

const mono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" })

export async function generateMetadata(): Promise<Metadata> {
  const pool = await getPool()
  return { title: "Flows", description: pool.tagline }
}

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
}

export default async function RootLayout(props: Readonly<{ children: React.ReactNode }>) {
  const { children } = props

  const [pool, user, sessionPresent, identityToken] = await Promise.all([
    getPool(),
    getUser(),
    hasSession(),
    getPrivyIdToken(),
  ])

  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${mono.variable} flex h-full flex-col`}>
        {isProduction() && <RefreshOnFocus />}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={350}>
            <Wagmi>
              <nav className="container flex items-center py-4 max-lg:justify-between md:py-5">
                <div className="lg:w-1/5">
                  <h2>
                    <Link
                      href="/"
                      className="flex items-center py-0.5 font-medium text-card-foreground max-sm:text-sm"
                    >
                      <Image src={Noggles} alt={pool.title} className="mr-2.5 h-5 w-auto md:h-8" />
                    </Link>
                  </h2>
                </div>
                <MenuDesktop />
                <div className="flex items-center justify-end space-x-2.5 lg:w-1/5">
                  {user && <RecipientPopover user={user} />}
                  {user && <CuratorPopover flow={pool} address={user.address} />}
                  <MenuAvatar user={user} hasSession={sessionPresent} />
                  <MenuMobile />
                </div>
              </nav>
              {children}
              <Toaster />
              <Analytics />
              {identityToken && <CommandPalette identityToken={identityToken} />}
              {user && <PromptFarcasterSignup user={user} />}
            </Wagmi>
          </TooltipProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
