import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
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
        <CardTitle className="text-base">Socials</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4">
            {socialProfiles.map((profile) => {
              if (!profile) return null
              return (
                <div
                  key={profile.url}
                  className="flex min-w-[160px] items-center gap-3 rounded-lg bg-accent/40 p-3"
                >
                  <SocialIcon url={profile.url} style={{ width: 32, height: 32 }} />
                  <div>
                    <div className="text-lg font-semibold tracking-tight">
                      {profile.followersCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="capitalize">{profile.platform.replace("Channel", "")}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
