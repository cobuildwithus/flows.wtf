"use server"

import { farcasterDb } from "@/lib/database/farcaster-db"

export interface FarcasterProfile {
  fid: string
  fname: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  verified_addresses: string[]
}

interface SearchUsernamesParams {
  query: string
  limit?: number
}

export async function searchFarcasterUsernames(
  params: SearchUsernamesParams,
): Promise<FarcasterProfile[]> {
  const { query, limit = 10 } = params

  if (!query || query.length < 2) {
    return []
  }

  try {
    const profiles = await farcasterDb.profile.findMany({
      where: {
        OR: [
          {
            fname: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            display_name: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        fid: true,
        fname: true,
        display_name: true,
        avatar_url: true,
        bio: true,
        verified_addresses: true,
      },
      orderBy: [
        {
          updated_at: "desc",
        },
      ],
      take: Math.min(limit, 50), // Cap at 50 results max
    })

    const mappedProfiles = profiles.map(
      (profile: {
        fid: bigint
        fname: string | null
        display_name: string | null
        avatar_url: string | null
        bio: string | null
        verified_addresses: string[]
      }) => ({
        fid: profile.fid.toString(),
        fname: profile.fname,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        verified_addresses: profile.verified_addresses || [],
      }),
    )

    // Sort to prioritize exact fname matches first
    return mappedProfiles.sort((a, b) => {
      const aFnameMatch = a.fname?.toLowerCase() === query.toLowerCase()
      const bFnameMatch = b.fname?.toLowerCase() === query.toLowerCase()

      if (aFnameMatch && !bFnameMatch) return -1
      if (!aFnameMatch && bFnameMatch) return 1
      return 0
    })
  } catch (error) {
    console.error("Error searching Farcaster usernames:", error)
    return []
  }
}
