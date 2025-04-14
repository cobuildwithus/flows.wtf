import type { Cast } from "@prisma/farcaster"

function tryParseJson(str: string): unknown | null {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

function normalizeJsonString(str: string): string {
  let s = str.replace(/'/g, '"').replace(/}\s*{/g, "},{").replace(/\s+/g, "")
  if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1)
  return s
}

export function getCastImages(cast: Pick<Cast, "embeds">): string[] {
  const raw = cast.embeds || "[]"
  let parsed: unknown = tryParseJson(normalizeJsonString(raw))

  if (typeof parsed === "string") parsed = tryParseJson(parsed)
  if (!Array.isArray(parsed)) return []

  return parsed
    .filter(
      (embed): embed is { url: string } =>
        typeof embed === "object" &&
        embed !== null &&
        "url" in embed &&
        typeof (embed as { url?: unknown }).url === "string",
    )
    .filter((embed) => embed.url.includes("imagedelivery"))
    .map((embed) => embed.url)
}
