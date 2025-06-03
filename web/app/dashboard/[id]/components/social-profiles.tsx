import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SocialIcon } from "@/components/ui/social-icon"
import { getSocialProfiles, SocialProfileUsernames } from "@/lib/social-metrics/social-profile"

interface Props {
  usernames: SocialProfileUsernames
}

export async function SocialProfiles(props: Props) {
  const { usernames } = props

  const socialProfiles = await getSocialProfiles(usernames)
  if (socialProfiles.length === 0) return null

  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Social Media</CardTitle>
            <CardDescription className="mt-1.5 text-xs">Engagement numbers</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {socialProfiles.map((profile) => {
            if (!profile) return null
            return (
              <div
                key={profile.url}
                className="flex items-center gap-4 rounded-lg bg-accent/40 p-4"
              >
                <SocialIcon url={profile.url} style={{ width: 40, height: 40 }} />
                <div>
                  <div className="text-2xl font-semibold tracking-tight">
                    {profile.followersCount.toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <span className="capitalize">{profile.platform.replace("Channel", "")}</span>{" "}
                    followers
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
