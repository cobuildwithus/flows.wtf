import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { GeneralLinkIcon } from "@/components/ui/general-link-icon"
import { UserProfile } from "@/components/user-profile/user-profile"
import Link from "next/link"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Props {
  bio: string
  links: Array<{ url: string; icon: string }>
  recipient: `0x${string}`
}

export function Builder(props: Props) {
  const { bio, links, recipient } = props

  return (
    <UserProfile hideLink address={recipient} withPopover={false}>
      {(profile) => (
        <Dialog>
          <DialogTrigger>
            <div className="group flex items-center text-xs md:text-sm">
              <span className="mr-2 opacity-50">by</span>
              <span className="mr-2 transition-colors group-hover:text-primary">
                {profile.display_name}
              </span>
              <Avatar className="size-5 rounded-full bg-primary md:size-6">
                <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
              </Avatar>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="sr-only">Builder</DialogTitle>
            <div className="space-y-6">
              <Link
                target="_blank"
                href={
                  profile.username
                    ? `https://farcaster.xyz/${profile.username}`
                    : `https://basescan.org/address/${recipient}`
                }
                className="inline-flex items-center gap-4 hover:opacity-80"
              >
                <Avatar className="size-12 bg-primary">
                  <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                </Avatar>
                <h2 className="text-xl font-semibold">{profile.display_name}</h2>
              </Link>

              <div className="space-y-4 whitespace-pre-line text-sm leading-relaxed text-secondary-foreground/70">
                {bio}
              </div>

              <div className="flex gap-3">
                {[
                  ...links,
                  { url: `https://basescan.org/address/${recipient}`, icon: "wallet" },
                ].map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    className="rounded-full bg-primary p-2 text-primary-foreground transition-opacity hover:opacity-75"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GeneralLinkIcon name={link.icon} className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </UserProfile>
  )
}
