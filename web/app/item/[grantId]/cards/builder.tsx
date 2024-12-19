import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { UserProfile } from "@/components/user-profile/user-profile"

interface Props {
  tags: string[]
  bio: string
  links: Array<{ url: string; icon: string }>
  recipient: `0x${string}`
}

export function Builder(props: Props) {
  const { tags, bio, links, recipient } = props

  return (
    <div className="col-span-full lg:col-span-4 lg:row-span-2">
      <div className="h-full rounded-xl border bg-secondary/50 p-5 text-secondary-foreground dark:bg-secondary">
        <UserProfile address={recipient} withPopover={false}>
          {(profile) => (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-12 bg-primary">
                  <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                </Avatar>
                <h2 className="text-xl font-semibold">{profile.display_name}</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge variant="outline" className="py-1 capitalize" key={tag}>
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="space-y-4 whitespace-pre-line text-sm leading-relaxed text-secondary-foreground/70">
                {bio}
              </div>

              <div className="flex gap-3">
                {links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    className="rounded-full bg-primary p-2 text-primary-foreground transition-opacity hover:opacity-75"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name={link.icon} className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </UserProfile>
      </div>
    </div>
  )
}
