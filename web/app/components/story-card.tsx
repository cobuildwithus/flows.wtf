import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { DateTime } from "@/components/ui/date-time"
import { UserProfile } from "@/components/user-profile/user-profile"
import { getPinataWithKey } from "@/lib/pinata/url-with-key"
import { Story } from "@prisma/flows"
import Image from "next/image"
import Link from "next/link"

export function StoryCard(props: { story: Story }) {
  const { header_image, title, tagline, created_at, id, participants } = props.story

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow dark:border dark:bg-card">
      {header_image && (
        <div className="h-32 w-full overflow-hidden rounded-lg md:h-44">
          <Image
            src={getPinataWithKey(header_image)}
            alt={title}
            className="size-full object-cover transition-transform group-hover:scale-110"
            width={320}
            height={160}
          />
        </div>
      )}
      <div className="grow p-4">
        <Link
          href={`/story/${id}`}
          className="text-base font-semibold leading-snug group-hover:text-primary"
        >
          {title}
          <span className="absolute inset-0" />
        </Link>
        <p className="mt-1.5 text-sm text-muted-foreground">{tagline}</p>
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
