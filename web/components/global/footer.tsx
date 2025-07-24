import Link from "next/link"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getUser } from "@/lib/auth/user"
import HelpCenterItem from "./help-center-item"

export default async function Footer() {
  const user = await getUser()
  const identityToken = user ? await getPrivyIdToken() : undefined

  return (
    <footer className="border-t bg-background py-16">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="font-medium">Developers</h3>
            <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link
                target="_blank"
                href="https://ponder-schemaonchain-production.up.railway.app/"
                className="hover:underline"
              >
                API
              </Link>
              <Link
                target="_blank"
                href="https://github.com/cobuildwithus/flows-protocol"
                className="hover:underline"
              >
                Protocol
              </Link>
              <Link
                target="_blank"
                href="https://github.com/cobuildwithus/flows.wtf"
                className="hover:underline"
              >
                Frontend
              </Link>
              <Link
                target="_blank"
                href="https://github.com/cobuildwithus/flows-protocol/blob/main/audits/NounsFlowAuditReport.md"
                className="hover:underline"
              >
                Audit
              </Link>
            </nav>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">Community</h3>
            <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link
                target="_blank"
                href="https://discord.gg/u3buFmphF8"
                className="hover:underline"
              >
                Discord
              </Link>
              <Link
                target="_blank"
                href="https://farcaster.xyz/~/channel/flows"
                className="hover:underline"
              >
                Farcaster
              </Link>
              <Link target="_blank" href="https://nouns.wtf" className="hover:underline">
                Nouns
              </Link>
            </nav>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">Team</h3>
            <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link
                target="_blank"
                href="https://farcaster.xyz/riderway.eth"
                className="hover:underline"
              >
                riderway
              </Link>
              <Link
                target="_blank"
                href="https://farcaster.xyz/rocketman"
                className="hover:underline"
              >
                rocketman
              </Link>
            </nav>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">More</h3>
            <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link
                target="_blank"
                href="https://farcaster.xyz/rocketman"
                className="hover:underline"
              >
                Contact
              </Link>
              <Link target="_blank" href="/legal/terms" className="hover:underline">
                Terms of Service
              </Link>
              <Link target="_blank" href="/legal/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              <HelpCenterItem user={user} identityToken={identityToken} />
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
