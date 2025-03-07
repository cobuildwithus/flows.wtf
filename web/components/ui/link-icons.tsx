import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Bitcoin,
  Dribbble,
  Gitlab,
  Twitch,
  Wallet,
  Youtube,
  Link,
} from "lucide-react"
import type { ReactNode } from "react"

interface LinkIconProps {
  name: string
  className?: string
}

export function GeneralLinkIcon({ name, className = "size-4" }: LinkIconProps): ReactNode {
  if (!name) return <Link className={className} />

  // Use the provided icon name directly
  switch (name) {
    // Social media platforms
    case "twitter":
      return <Twitter className={className} />
    case "facebook":
      return <Facebook className={className} />
    case "instagram":
      return <Instagram className={className} />
    case "linkedin":
      return <Linkedin className={className} />
    case "github":
      return <Github className={className} />
    case "youtube":
      return <Youtube className={className} />
    case "twitch":
      return <Twitch className={className} />
    case "dribbble":
      return <Dribbble className={className} />
    case "gitlab":
      return <Gitlab className={className} />

    // Blockchain/Crypto
    case "wallet":
      return <Wallet className={className} />
    case "bitcoin":
      return <Bitcoin className={className} />

    // Default case
    default:
      return <Link className={className} />
  }
}
