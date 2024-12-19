import "server-only"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { UserProfile } from "@/components/user-profile/user-profile"
import { getVoters } from "../components/get-voters"

interface Props {
  contract: `0x${string}`
  grantId: string
  flowVotesCount: string
  isFlow?: boolean
}

export const Voters = async (props: Props) => {
  const { contract, grantId, flowVotesCount, isFlow } = props

  const voters = await getVoters(contract, grantId)

  return (
    <div className="grow rounded-xl border bg-white/50 p-5 dark:bg-transparent">
      <h3 className="mb-4 font-medium">Voters</h3>
      {voters.length === 0 && (
        <div className="text-sm text-muted-foreground">
          There are no direct votes for this {isFlow ? "flow" : "grant"} yet.
          <br />
          <br />
          {!isFlow &&
            Number(flowVotesCount) <= 1000 &&
            `The parent budget has limited support (${flowVotesCount} votes).`}
        </div>
      )}
      {voters.length > 0 && (
        <div className="grid gap-x-4 gap-y-6 lg:grid-cols-2">
          {voters.map((v) => (
            <UserProfile address={v.voter} key={v.voter}>
              {(profile) => (
                <div className="flex items-center">
                  <Avatar className="mr-2.5 size-7 rounded-full bg-primary">
                    <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                  </Avatar>

                  <div className="flex flex-col">
                    <span className="mr-1.5 truncate text-sm font-medium">
                      {profile.display_name}
                    </span>
                    <span className="text-xs text-muted-foreground">{v.votesCount} votes</span>
                  </div>
                </div>
              )}
            </UserProfile>
          ))}
        </div>
      )}
    </div>
  )
}
