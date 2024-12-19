import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { UserProfile } from "@/components/user-profile/user-profile"
import { Gradient, GradientCard } from "./gradient-card"

interface Props {
  gradient: Gradient
  text: string
  recipient: string
}

export function WhoCard(props: Props) {
  const { gradient, text, recipient } = props

  return (
    <GradientCard gradient={gradient} className="p-5 lg:h-2/5">
      <div className="flex flex-col items-start">
        <UserProfile address={recipient as `0x${string}`} withPopover={false}>
          {(profile) => (
            <Avatar className="size-6 bg-primary">
              <AvatarImage src={profile.pfp_url} />
            </Avatar>
          )}
        </UserProfile>
        <div className="mt-8 text-pretty text-sm leading-normal lg:mt-4">{text}</div>
      </div>
    </GradientCard>
  )
}
