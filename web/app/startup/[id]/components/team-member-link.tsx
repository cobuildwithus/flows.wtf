"use client"

interface TeamMemberLinkProps {
  username: string
  displayName: string
  children: React.ReactNode
}

export function TeamMemberLink({ username, displayName, children }: TeamMemberLinkProps) {
  return (
    <a
      href={`https://farcaster.xyz/${username}`}
      className="hover:underline"
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </a>
  )
}
