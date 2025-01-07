import { Cast } from "@prisma/farcaster"

interface EmbedUrl {
  url: string
}

export function getCastImages(cast: Pick<Cast, "embeds">): string[] {
  return JSON.parse(cast.embeds || "[]")
    .filter((embed: EmbedUrl): embed is EmbedUrl => "url" in embed)
    .map((embed: EmbedUrl) => embed.url)
    .filter((url: string) => url.includes("imagedelivery"))
}
