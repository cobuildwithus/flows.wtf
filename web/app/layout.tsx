import { CuratorPopover } from "@/components/global/curator-popover/curator-popover"
import { MenuDesktop, MenuMobile } from "@/components/global/menu"
import { MenuAvatar } from "@/components/global/menu-avatar"
import { PromptFarcasterSignup } from "@/components/global/prompt-farcaster-signup"
import { RecipientPopover } from "@/components/global/recipient-popover/recipient-popover"
import { RefreshOnFocus } from "@/components/global/refresh-on-focus"
import { ThemeProvider } from "@/components/global/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { getUser, hasSession } from "@/lib/auth/user"
import { getPool } from "@/lib/database/queries/pool"
import { isProduction } from "@/lib/utils"
import Wagmi from "@/lib/wagmi/wagmi-provider"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"
import { Roboto_Mono } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import CommandPalette from "./components/search/command-dialog"
import "./globals.css"
import Flows from "@/public/logo.png"
import { Nav } from "@/components/global/nav"

const mono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" })

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Flows",
    description:
      "The AI powered capital allocation platform. Get paid to make the world a better place.",
  }
}

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
}

export default async function RootLayout(props: Readonly<{ children: React.ReactNode }>) {
  const { children } = props

  const [pool, user, sessionPresent] = await Promise.all([getPool(), getUser(), hasSession()])

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
              <Nav pool={pool} user={user} sessionPresent={sessionPresent} />
              {children}
              <Toaster />
              <Analytics />
              <CommandPalette />
              {user && <PromptFarcasterSignup user={user} />}
            </Wagmi>
          </TooltipProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
