import Link from "next/link"
import { MenuDesktop, MenuMobile } from "@/components/global/menu"
import { MenuAvatar } from "@/components/global/menu-avatar"
import { RecipientPopover } from "@/components/global/recipient-popover/recipient-popover"
import { Logo } from "@/components/global/logo"
import { User } from "@/lib/auth/user"

interface Props {
  user?: User
  sessionPresent: boolean
}

export function Nav({ user, sessionPresent }: Props) {
  return (
    <nav className="container flex items-center py-5 max-lg:justify-between md:py-6">
      <div className="lg:w-1/5">
        <h2>
          <Link
            href="/"
            className="flex items-center py-0.5 font-medium text-card-foreground max-sm:text-sm"
          >
            <Logo />
          </Link>
        </h2>
      </div>
      <MenuDesktop />
      <div className="flex items-center justify-end space-x-2.5 md:space-x-3 lg:w-1/5">
        {user && <RecipientPopover user={user} />}
        <MenuAvatar user={user} hasSession={sessionPresent} />
        <MenuMobile />
      </div>
    </nav>
  )
}
