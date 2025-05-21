import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Profile } from "@/components/user-profile/get-user-profile"
import { PlusIcon } from "lucide-react"
import Image from "next/image"

interface Props {
  profiles: Array<Profile>
}

export async function Team(props: Props) {
  const { profiles } = props

  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Team Members</CardTitle>
            <CardDescription className="mt-1.5 text-xs">
              Discover the people building the project
            </CardDescription>
          </div>
          <Button variant="outline" size="icon">
            <PlusIcon className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <ScrollArea className="pointer-events-auto mt-2 w-full whitespace-nowrap">
          <div className="flex space-x-2.5">
            {profiles
              .filter((p) => !!p.pfp_url)
              .map((p) => (
                <div key={p.address} className="flex shrink-0 flex-col items-center">
                  <Image
                    src={p.pfp_url!}
                    alt={p.display_name}
                    width={64}
                    height={64}
                    className="z-20 size-14 rounded-full shadow"
                  />

                  <div className="flex w-48 -translate-y-8 flex-col rounded-lg bg-accent/50 p-4 pt-12 text-center dark:bg-muted/30">
                    <h3 className="font-medium">
                      <a
                        href={`https://warpcast.com/${p.username}`}
                        target="_blank"
                        className="text-sm hover:underline"
                      >
                        {p.display_name}
                      </a>
                    </h3>
                    <span className="mt-1 text-xs text-muted-foreground">Brewing coffee</span>
                  </div>
                </div>
              ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
