import type { FarcasterProfile } from "./search-usernames"

/**
 * Extract the primary Ethereum address from a Farcaster profile
 * Returns the first verified address or null if none exist
 */
export function getProfileAddress(profile: FarcasterProfile): string | null {
  if (profile.verified_addresses && profile.verified_addresses.length > 0) {
    // Filter for Ethereum addresses (42 characters starting with 0x)
    const ethAddresses = profile.verified_addresses.filter(
      (address) => address.startsWith("0x") && address.length === 42,
    )
    return ethAddresses.length > 0 ? ethAddresses[0] : null
  }
  return null
}

/**
 * Get display name for a Farcaster profile
 */
export function getProfileDisplayName(profile: FarcasterProfile): string {
  return profile.display_name || profile.fname || `User ${profile.fid}`
}

/**
 * Get username for a Farcaster profile
 */
export function getProfileUsername(profile: FarcasterProfile): string | null {
  return profile.fname ? `@${profile.fname}` : null
}

/**
 * Check if a profile has a verified Ethereum address
 */
export function hasVerifiedAddress(profile: FarcasterProfile): boolean {
  return profile.verified_addresses && profile.verified_addresses.length > 0
}
