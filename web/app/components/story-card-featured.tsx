import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { DateTime } from "@/components/ui/date-time"
import { UserProfile } from "@/components/user-profile/user-profile"
import { getPinataWithKey } from "@/lib/pinata/url-with-key"
import { Story } from "@prisma/flows"
import Image from "next/image"
import Link from "next/link"

export function FeaturedStoryCard(props: { story: Story }) {
  const { header_image, title, tagline, created_at, id, participants } = props.story

  return (
    <div className="group relative isolate flex min-h-72 flex-col justify-between overflow-hidden rounded-xl shadow dark:border md:col-span-2">
      {header_image && (
        <div className="pointer-events-none absolute inset-0 -z-10 size-full overflow-hidden">
          <Image
            src={getPinataWithKey(header_image)}
            alt={title}
            className="size-full object-cover transition-transform group-hover:scale-110"
            width={674}
            priority
            height={328}
          />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />

      <div className="flex items-center justify-between space-x-1.5 p-4 md:p-6">
        <div className="flex items-center gap-1.5">
          {participants.map((address) => (
            <UserProfile address={address as `0x${string}`} key={address}>
              {(profile) => (
                <Avatar className="size-5 lg:size-6">
                  <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                </Avatar>
              )}
            </UserProfile>
          ))}
        </div>
        <p className="text-sm text-white">
          <DateTime date={created_at} relative short />
        </p>
      </div>

      <div className="p-5 pt-36 md:p-6">
        <Link
          href={`/story/${id}`}
          className="text-base font-semibold leading-snug group-hover:text-primary"
        >
          <h3 className="text-balance text-lg font-medium leading-tight text-white md:text-xl">
            {title}
          </h3>
          <span className="absolute inset-0" />
        </Link>
        <p className="mt-1.5 text-pretty text-sm text-white/80">{tagline}</p>
      </div>
    </div>
  )
}
