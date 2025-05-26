import { User } from "@/lib/auth/user"
import { getShortEthAddress } from "@/lib/utils"
import { AvatarImage } from "@radix-ui/react-avatar"
import Link from "next/link"
import { Avatar } from "../ui/avatar"

export function AvatarLink({ user }: { user: User }) {
  const username = user.username || getShortEthAddress(user.address)
  return (
    <div className="flex items-center gap-2">
      {user.avatar && (
        <Avatar className="size-6 rounded-full">
          <AvatarImage src={user.avatar} alt={user.username} />
        </Avatar>
      )}
      {user.fid ? (
        <Link
          href={`https://farcaster.xyz/${user.username}`}
          target="_blank"
          className="text-sm font-medium hover:underline"
        >
          {username}
        </Link>
      ) : (
        <Link
          href={`https://basescan.org/address/${user.address}`}
          target="_blank"
          className="text-sm font-medium hover:underline"
        >
          {username}
        </Link>
      )}
    </div>
  )
}
