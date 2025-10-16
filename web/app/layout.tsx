import { Nav } from "@/components/global/nav"
import { PromptFarcasterSignup } from "@/components/global/prompt-farcaster-signup"
import { RefreshOnFocus } from "@/components/global/refresh-on-focus"
import { ThemeProvider } from "@/components/global/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { getUser, hasSession } from "@/lib/auth/user"
import { isProduction } from "@/lib/utils"
import Wagmi from "@/lib/wagmi/wagmi-provider"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"
import { Roboto_Mono } from "next/font/google"
import CommandPalette from "./components/search/command-dialog"
import "./globals.css"

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

  const [user, sessionPresent] = await Promise.all([getUser(), hasSession()])

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
              <Nav user={user} sessionPresent={sessionPresent} />
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
