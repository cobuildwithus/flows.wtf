import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { DateTime } from "@/components/ui/date-time"
import { UserProfile } from "@/components/user-profile/user-profile"
import { getIpfsUrl } from "@/lib/utils"
import type { Story } from "@prisma/flows"
import Image from "next/image"
import Link from "next/link"

export function StoryCard(props: { story: Story }) {
  const { header_image, title, created_at, id, participants } = props.story

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow dark:border dark:bg-card">
      {header_image ? (
        <div className="h-32 w-full overflow-hidden rounded-lg md:h-44">
          <Image
            src={getIpfsUrl(header_image, "pinata")}
            alt={title}
            className="size-full object-cover transition-transform group-hover:scale-110"
            width={320}
            height={160}
          />
        </div>
      ) : (
        <div className="h-32 w-full overflow-hidden rounded-lg bg-muted md:h-44">
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No header image</p>
          </div>
        </div>
      )}
      <div className="grow p-4 pb-1 pt-3">
        <Link
          href={`/story/${id}`}
          className="line-clamp-2 text-base font-medium leading-snug group-hover:text-primary"
        >
          {title}
          <span className="absolute inset-0" />
        </Link>
      </div>

      <div className="flex items-center justify-between space-x-1.5 p-4">
        <div className="flex items-center gap-1.5">
          {participants.map((address) => (
            <UserProfile address={address as `0x${string}`} key={address}>
              {(profile) => (
                <Avatar className="size-5">
                  <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                </Avatar>
              )}
            </UserProfile>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          <DateTime date={created_at} relative short />
        </p>
      </div>
    </div>
  )
}
